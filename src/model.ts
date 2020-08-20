import {
  ILayoutRestorer,
  JupyterFrontEnd
} from '@jupyterlab/application';

import {
  WidgetTracker
} from '@jupyterlab/apputils';

import {
  PathExt
} from '@jupyterlab/coreutils';

import {
  FileBrowser,
  FileBrowserModel
} from '@jupyterlab/filebrowser';

import {
  ContentsManager
} from '@jupyterlab/services';

import {
  PromiseDelegate
} from '@lumino/coreutils';

import {
  ISignal,
  Signal
} from '@lumino/signaling';

import {
  IMosaikExtension,
  MosaikDockerSim
} from './tokens';

import {
  CommandIDs
} from './command-ids'

import {
  executeWithCallbacks,
  sendRequest
} from './mosaik-docker-jl';

import {
  SimStatusWidget
} from './widgets/sim-status-widget';

import {
  SimSetupBuildWidget
} from './widgets/sim-setup-build-widget';


/** Main extension class */
export class MosaikExtension implements IMosaikExtension {

  constructor(
    app: JupyterFrontEnd,
    fileBrowser: FileBrowser,
    restorer: ILayoutRestorer
  )
  {
    this._app = app;
    this._fileBrowser = fileBrowser;
    this._stateChanged = new Signal<this, void>(this);

    this._simStatusWidget = new SimStatusWidget( this );
    this._simStatusWidgetTracker = new WidgetTracker<SimStatusWidget> ( {
      namespace: 'sim-status-widget'
    } );
    restorer.restore( this._simStatusWidgetTracker, {
      command: CommandIDs.getSimStatus,
      args: () => ( { suppressError: true } ),
      name: () => 'sim-status-widget'
    } );

    fileBrowser.model.pathChanged.connect( this._checkIfValidSimDir, this );
    //SfileBrowser.model.refreshed.connect( this._checkIfValidSimDir, this );
  }


  async getVersion(): Promise<MosaikDockerSim.Version>
  {
		const response = await sendRequest( 'version' );

    const code = await response.code;

    if ( 0 === code ) {
      return Promise.resolve( {
        version: await response.message
      } );
    }

    return Promise.reject(
      `[mosaik-docker-jl] getVersion() failed!\nerror code: ${ code }`
    );
  }


  async retrieveUserHomeDir(): Promise<void>
  {
		const response = await sendRequest( 'get_user_home_dir' );

    const code = await response.code;

    if ( 0 === code ) {
      this._userHomeDir = await response.message;
      return Promise.resolve();
    }

    return Promise.reject(
      `[mosaik-docker-jl] getUserHomeDir() failed!\nerror code: ${ code }`
    );
  }


  async createSimSetup(
    name: string
  ): Promise<MosaikDockerSim.CreateSimSetupStatus>
  {
		const response = await sendRequest(
      'create_sim_setup', 'POST',
      {
        name: name,
        dir: this._fileBrowser.model.path
      }
    );

    const code = await response.code;

    if ( 0 === code ) {
      return Promise.resolve( {
        status: await response.message
      } );
    }

    const error = await response.error;

    return Promise.reject(
      `[mosaik-docker-jl] createSimSetup() failed!\nerror code: ${ code }\nerror: ${ error }`
    );
  }


  async configureSimSetup(
    scenarioFile: string,
    dockerFile: string,
    extraFiles: Array<string>,
    extraDirs: Array<string>,
    results: Array<string>
  ): Promise<MosaikDockerSim.ConfigureSimSetupStatus>
  {
		const response = await sendRequest(
      'configure_sim_setup', 'POST',
      {
        dir: this._simSetupRoot,
        docker_file: dockerFile,
        scenario_file: scenarioFile,
        extra_files: extraFiles,
        extra_dirs: extraDirs,
        results: results
      }
    );

    const code = await response.code;

    if ( 0 === code ) {
      return Promise.resolve( {
        status: await response.message
      } );
    }

    const error = await response.error;

    return Promise.reject(
      `[mosaik-docker-jl] configureSimSetup() failed!\nerror code: ${ code }\nerror: ${ error }`
    );
  }



  async buildSimSetup(): Promise<void>
  {
    const simSetupPath = this._simSetupRoot;
    let simSetupBuildWidget = new SimSetupBuildWidget( simSetupPath );

    // Attach the widget to the main work area.
    this._app.shell.add( simSetupBuildWidget, 'main' );

    // Activate the widget
    this._app.shell.activateById( simSetupBuildWidget.id );

    const commTargetPrefix = `buildSimSetup@${ simSetupPath }#`;

    // Specify code to be executed on the server. Use callback interface 'comm'
    // to send back output (see function executeWithCallbacks for details).
    const code = `
from mosaik_docker.cli.build_sim_setup import build_sim_setup
build = build_sim_setup( '${ simSetupPath }', comm.send_line )
comm.close( build['status'] )`;

    const check = new PromiseDelegate();

    try {
      const executeReply = await executeWithCallbacks(
        commTargetPrefix,
        code,
        msg => {
          simSetupBuildWidget.updateStatus( msg.content.data );
        },
        msg => {
          simSetupBuildWidget.done( msg.content.data );
          check.resolve( undefined );
        }
      );

      // Wait for the callback interface to be closed on our side.
      await check.promise;

      const status = await executeReply.status;

      if ( status === 'ok' ) {
        return Promise.resolve();
      }
    } catch ( error ) {
      simSetupBuildWidget.done();
      return Promise.reject(
        `[mosaik-docker-jl] buildSimSetup() failed! \nstatus: ${ error.status }\nerror: ${ error.error }`
      );
    }
  }


  async checkSimSetup(): Promise<MosaikDockerSim.CheckSimSetupStatus>
  {
		const response = await sendRequest(
      'check_sim_setup', 'POST',
      {
        dir: this._simSetupRoot
      }
    );

    const code = await response.code;

    if ( 0 === code ) {
      return Promise.resolve( {
        valid: true,
        status: await response.message
      } );
    }

    if ( 1 === code ) {
      return Promise.resolve( {
        valid: false,
        status: await response.message
      } );
    }

    const error = await response.error;

    return Promise.reject(
      `[mosaik-docker-jl] checkSimSetup() failed!\nerror code: ${ code }\nerror: ${ error }`
    );
  }


  async deleteSimSetup(): Promise<MosaikDockerSim.DeleteSimSetupStatus>
  {
    // Path to sim setup directory that is to be deleted.
    const delSimSetupRoot = this._simSetupRoot;

    // Change to parent directory of this sim setup's root directory.
    if ( undefined === this._userHomeDir ) await this.retrieveUserHomeDir();
    const cdDir = PathExt.relative( delSimSetupRoot, this._userHomeDir );
    await this._fileBrowser.model.cd( cdDir );

    // Execute command 'delete_sim_setup' on the server.
		const response = await sendRequest(
      'delete_sim_setup', 'POST',
      {
        dir: delSimSetupRoot
      }
    );

    // Handle response from server.
    const code = await response.code;
    if ( 0 === code ) {
      return Promise.resolve( {
        valid: true,
        status: await response.message
      } );
    } else if ( 1 === code ) {
      return Promise.resolve( {
        valid: false,
        status: await response.message
      } );
    }

    // Handle errors.
    const error = await response.error;
    return Promise.reject(
      `[mosaik-docker-jl] deleteSimSetup() failed!\nerror code: ${ code }\nerror: ${ error }`
    );
  }


  async startSim(): Promise<MosaikDockerSim.StartSimStatus>
  {
		const response = await sendRequest(
      'start_sim', 'POST',
      {
        dir: this._simSetupRoot
      }
    );

    const code = await response.code;

    if ( 0 === code ) {
      this._notifyStateChanged();
      return Promise.resolve( { status: await response.message } );
    }

    const error = await response.error;

    return Promise.reject(
      `[mosaik-docker-jl] startSim() failed!\nerror code: ${ code }\nerror: ${ error }`
    );
  }


  async cancelSim(
    simId: string
  ): Promise<MosaikDockerSim.CancelSimStatus>
  {
		const response = await sendRequest(
      'cancel_sim', 'POST',
      {
        dir: this._simSetupRoot,
        id: simId
      }
    );

    const code = await response.code;

    if ( 0 === code ) {
      this._notifyStateChanged();
      return Promise.resolve( { status: await response.message } );
    }

    const error = await response.error;

    return Promise.reject(
      `[mosaik-docker-jl] cancelSim() failed!\nerror code: ${ code }\nerror: ${ error }`
    );
  }


  async clearSim(
    simId: string
  ): Promise<MosaikDockerSim.ClearSimStatus>
  {
		const response = await sendRequest(
      'clear_sim', 'POST',
      {
        dir: this._simSetupRoot,
        id: simId
      }
    );

    const code = await response.code;

    if ( 0 === code ) {
      this._notifyStateChanged();
      return Promise.resolve( { status: await response.message } );
    }

    const error = await response.error;

    return Promise.reject(
      `[mosaik-docker-jl] clearSim() failed!\nerror code: ${ code }\nerror: ${ error }`
    );
  }


  async getSimResults(
    simId: string
  ): Promise<MosaikDockerSim.GetSimResultsStatus>
  {
		const response = await sendRequest(
      'get_sim_results', 'POST',
      {
        dir: this._simSetupRoot,
        id: simId
      }
    );

    const code = await response.code;

    if ( 0 === code ) {
      return Promise.resolve( {
        status: await response.message
      } );
    }

    const error = await response.error;

    return Promise.reject(
      `[mosaik-docker-jl] getSimResults() failed!\nerror code: ${ code }\nerror: ${ error }`
    );
  }


  async getSimIds(): Promise<MosaikDockerSim.SimIds>
  {
		const response = await sendRequest(
      'get_sim_ids', 'POST',
      {
        dir: this._simSetupRoot
      }
    );

    const code = await response.code;

    if ( 0 === code ) {
      const simIds = await response.message;
      return Promise.resolve( {
        up: simIds.up,
        down: simIds.down
      } );
    }

    const error = await response.error;

    return Promise.reject(
      `[mosaik-docker-jl] getSimIds() failed!\nerror code: ${ code }\nerror: ${ error }`
    );
  }


  async getSimStatus(): Promise<MosaikDockerSim.SimStatus>
  {
		const response = await sendRequest(
      'get_sim_status', 'POST',
      { dir: this._simSetupRoot }
    );

    const code = await response.code;

    if ( 0 === code ) {
      return Promise.resolve( {
        dir: this._simSetupRoot,
        status: await response.message
      } );
    }

    const error = await response.error;

    return Promise.reject(
      `[mosaik-docker-jl] getSimStatus() failed!\nerror code: ${ code }\nerror: ${ error }`
    );
  }


  async displaySimStatus(): Promise<void>
  {
    await this._fileBrowser.model.restored;
    await this._getSimSetupRoot();

    if ( !this._isValidSimSetup ) {
      const path = this._simSetupRoot;
      return Promise.reject(
        `[mosaik-docker-jl] displaySimStatus() failed!\ninvalid directory:${ path }`
      );
    }

    if ( !this._simStatusWidget.isAttached ) {
      // Attach the widget to the main work area if it's not there.
      this._app.shell.add( this._simStatusWidget, 'main' );
    }

    if ( !this._simStatusWidgetTracker.has( this._simStatusWidget ) ) {
      // Track the state of the widget for later restoration
      this._simStatusWidgetTracker.add( this._simStatusWidget );
    }

    // Activate the widget.
    this._app.shell.activateById( this._simStatusWidget.id );

    const status = await this.getSimStatus();
    await this._simStatusWidget.updateStatus( status );
  }


  async getSimSetupConfigData(): Promise<MosaikDockerSim.ConfigData> {

    try {
      // Specify path to config file of current sim setup.
      if ( undefined === this._userHomeDir ) await this.retrieveUserHomeDir();
      const relSetupPath = PathExt.relative( this._userHomeDir, this._simSetupRoot );
      const configFilePath = PathExt.join( relSetupPath, 'mosaik-docker.json' );

      // Retrieve the file from the server.
      const contentManager = new ContentsManager();
      const contentModel = await contentManager.get( configFilePath );

      // Parse the file content and return it as promise.
      const data: MosaikDockerSim.ConfigData = JSON.parse( contentModel.content );
      return Promise.resolve( data );
    } catch ( error ) {
      return Promise.reject(
        `[mosaik-docker-jl] getSimSetupConfigData() failed!\n${ error }`
      );
    }
  }


  public get stateChanged(): ISignal<this, void>
  {
    return this._stateChanged;
  }


  get isValidSimSetup(): boolean
  {
    return this._isValidSimSetup;
  }


  get simSetupRoot(): string
  {
    return this._simSetupRoot;
  }


  get userHomeDir(): string
  {
    return this._userHomeDir;;
  }


  /**
   * Get whether the model is disposed.
   */
  get isDisposed(): boolean
  {
    return this._isDisposed;
  }


  /**
   * Dispose of the resources held by the model.
   */
  dispose(): void
  {
    if ( this.isDisposed ) {
      return;
    }
    this._isDisposed = true;
  }


  private async _checkIfValidSimDir(
    emitter: FileBrowserModel
  ): Promise<void>
  {
    const oldStatus = this._isValidSimSetup;

    await this._getSimSetupRoot();

    if ( oldStatus != this._isValidSimSetup ) {
      this._notifyStateChanged();
    }

    return Promise.resolve();
  }


  private async _getSimSetupRoot(): Promise<void>
  {
    const response = await sendRequest(
      'get_sim_setup_root', 'POST',
      {
        dir: this._fileBrowser.model.path
      }
    );

    const code = await response.code;

    if ( 0 === code ) {
      this._isValidSimSetup = true;
      this._simSetupRoot = await response.message;
    } else {
      this._isValidSimSetup = false;
    }

    return Promise.resolve();
  }

  private _notifyStateChanged() {
    // Emit signal that notifies that the extension state has changed.
    this._stateChanged.emit();

    // In case the sim status widget is active, update its contents.
    if ( this._simStatusWidget.isAttached && this._isValidSimSetup ) {
      this.displaySimStatus();
    }
  }

  private _app: JupyterFrontEnd | null;
  private _fileBrowser: FileBrowser;
  private _simStatusWidgetTracker: WidgetTracker;

  private _simStatusWidget: SimStatusWidget;

  private _isValidSimSetup: boolean;
  private _simSetupRoot: string;

  private _userHomeDir: string = undefined;

  private _stateChanged: Signal<this, void>;
  private _isDisposed: boolean = false;

}
