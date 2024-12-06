import { ILayoutRestorer, JupyterFrontEnd } from '@jupyterlab/application';

import { WidgetTracker } from '@jupyterlab/apputils';

import { PathExt } from '@jupyterlab/coreutils';

import { FileBrowser, FileBrowserModel } from '@jupyterlab/filebrowser';

import { ContentsManager } from '@jupyterlab/services';

import { PromiseDelegate } from '@lumino/coreutils';

import { ISignal, Signal } from '@lumino/signaling';

import { IMosaikDockerExtension, MosaikDocker } from './tokens';

import { MosaikDockerAPI } from './mosaik-docker-jl';

import { CommandIDs } from './command-ids';

import { SimStatusWidget } from './widgets/sim-status-widget';

import { SimSetupConfigureWidget } from './widgets/sim-setup-configure-widget';

import { SimSetupBuildWidget } from './widgets/sim-setup-build-widget';


export namespace MosaikDockerExtension {
  /**
   * Definition of initialization options of class MosaikDockerExtension.
   */
  export interface IOptions {
    /** Frontend application. */
    app: JupyterFrontEnd;

    /** File browser extension */
    fileBrowser: FileBrowser;

    /** Application layout restorer */
    restorer: ILayoutRestorer | null;
  }
}

/**
 * Main extension class, implementing the mosaik-docker extension model.
 * The model is supposed to act on the currently activated simulation setup.
 * A simulation setup is activated by navigating to it with the help of the
 * file browser (i.e., the simulation setup's root folder or one of its
 * subfolders is the current working directory).
 */
export class MosaikDockerExtension implements IMosaikDockerExtension {
  /**
   * Returns an instance of the mosaik-docker extension model.
   *
   * @param options - initialization options
   * @returns instance of extension model
   */
  constructor(options: MosaikDockerExtension.IOptions) {
    // Save refereces to the frontend application and the file browser extension.
    this._app = options.app;
    this._fileBrowser = options.fileBrowser;

    // Initialize signal for notifying changes of the model's state.
    this._modelChanged = new Signal<this, void>(this);

    // Initialize the sim status widget and its layout tracker.
    this._simStatusWidget = new SimStatusWidget({ model: this });
    this._simStatusWidgetTracker = new WidgetTracker<SimStatusWidget>({
      namespace: 'sim-status-widget'
    });

    // If available, add to the layout restorer the sim status widget layout tracker.
    if (options.restorer) {
      // When JupyterLab is started and the widget is restored, no simulation setup may
      // currently be activated. In such case, the error message will be suppressed.
      options.restorer.restore(this._simStatusWidgetTracker, {
        command: CommandIDs.getSimStatus,
        args: () => ({ suppressError: true }),
        name: () => 'sim-status-widget'
      });
    }

    // Check if the current working directory is a valid
    // simulation setup every time the working directory changes.
    options.fileBrowser.model.pathChanged.connect(
      this._checkIfValidSimDir,
      this
    );
    //fileBrowser.model.refreshed.connect(
    //  this._checkIfValidSimDir,
    //  this
    //);
  }

  /**
   * Retrieve the installed version of the extension.
   * @returns version information
   */
  async getVersion(): Promise<MosaikDocker.IVersion> {
    // Send request to server.
    const response = await MosaikDockerAPI.sendRequest('version');

    // Wait for response and check response code.
    const code = await response.code;

    if (0 === code) {
      // Request has been handled successfully.
      return Promise.resolve({
        version: await response.message
      });
    }

    return Promise.reject(
      `[mosaik-docker-jl] getVersion() failed!\nerror code: ${code}`
    );
  }

  /**
   * Create a new simulation setup in the current working directory.
   * @param name - name of new simulation setup
   * @returns creation status
   */
  async createSimSetup(
    name: string
  ): Promise<MosaikDocker.ICreateSimSetupStatus> {
    const response = await MosaikDockerAPI.sendRequest(
      'create_sim_setup',
      'POST',
      {
        name: name,
        dir: this._fileBrowser.model.path
      }
    );

    const code = await response.code;

    if (0 === code) {
      return Promise.resolve({
        status: await response.message
      });
    }

    const error = await response.error;

    return Promise.reject(
      `[mosaik-docker-jl] createSimSetup() failed!\nerror code: ${code}\nerror: ${error}`
    );
  }

  /**
   * Configure a simulation setup.
   * @param data - simulation setup configuration data
   * @param dir - path to simulation setup (active simulation setup if not specified)
   * @returns configuration status
   */
  async configureSimSetup(
    data: MosaikDocker.IOrchestratorConfigData,
    dir?: string
  ): Promise<MosaikDocker.IConfigureSimSetupStatus> {
    const response = await MosaikDockerAPI.sendRequest(
      'configure_sim_setup',
      'POST',
      {
        dir: this.simSetupRoot,
        dockerFile: data.dockerFile,
        scenarioFile: data.scenarioFile,
        extraFiles: data.extraFiles,
        extraDirs: data.extraDirs,
        results: data.results
      }
    );

    const code = await response.code;

    if (0 === code) {
      return Promise.resolve({
        status: await response.message
      });
    }

    const error = await response.error;

    return Promise.reject(
      `[mosaik-docker-jl] configureSimSetup() failed!\nerror code: ${code}\nerror: ${error}`
    );
  }

  /**
   * Build currently active simulation setup.
   */
  async buildSimSetup(): Promise<void> {
    // Path to root folder of currently active simulation setup.
    const simSetupDir = this._simSetupRoot;

    if (!simSetupDir) return Promise.reject(
      `[mosaik-docker-jl] buildSimSetup() failed! \nsimulation setup directory Undefined:`
    );

    // Create new widget for displaying the build status.
    const simSetupBuildWidget = new SimSetupBuildWidget({ simSetupDir });

    if (!this._app) return Promise.reject(
      `[mosaik-docker-jl] buildSimSetup() failed! \nstatus: front end shell not available`
    );

    // Attach the widget to the main work area.
    this._app.shell.add(simSetupBuildWidget, 'main');

    // Activate the widget
    this._app.shell.activateById(simSetupBuildWidget.id);

    // Specify prefix for communication target.
    const commTargetPrefix = `buildSimSetup@${simSetupDir}#`;

    // Specify code to be executed on the server. Use callback interface 'comm'
    // to send back output (see function executeWithCallbacks for details).
    const code = `
from mosaik_docker.cli.build_sim_setup import build_sim_setup
build = build_sim_setup( '${simSetupDir}', comm.send_line )
comm.close( build['status'] )`;

    // Create promise delegate for waiting for the callback interface to be closed.
    const check = new PromiseDelegate();

    try {
      const executeReply = await MosaikDockerAPI.executeWithCallbacks(
        commTargetPrefix,
        code,
        msg => {
          // onMsg callback function.
          // Update build status with reply messages.
          simSetupBuildWidget.updateStatus(msg.content.data);
        },
        msg => {
          // onClose callback function.
          // Update build status with final reply message.
          simSetupBuildWidget.done(msg.content.data);
          // Resolve this promise to signal that the
          // callback interface will be closed now.
          check.resolve(undefined);
        }
      );

      // Wait for the callback interface to be closed on our side.
      await check.promise;

      const status = await executeReply.status;

      if (status === 'ok') {
        return Promise.resolve();
      }
    } catch (error: any) {
      simSetupBuildWidget.done();
      return Promise.reject(
        `[mosaik-docker-jl] buildSimSetup() failed! \nstatus: ${
          error.status
        }\nerror: ${error.error}`
      );
    }
  }

  /**
   * Check currently active simulation setup.
   * @returns check status
   */
  async checkSimSetup(): Promise<MosaikDocker.ICheckSimSetupStatus> {
    const response = await MosaikDockerAPI.sendRequest(
      'check_sim_setup',
      'POST',
      {
        dir: this._simSetupRoot
      }
    );

    const code = await response.code;

    if (0 === code) {
      return Promise.resolve({
        valid: true,
        status: await response.message
      });
    }

    if (1 === code) {
      return Promise.resolve({
        valid: false,
        status: await response.message
      });
    }

    const error = await response.error;

    return Promise.reject(
      `[mosaik-docker-jl] checkSimSetup() failed!\nerror code: ${code}\nerror: ${error}`
    );
  }

  /**
   * Delete currently active simulation setup.
   * @returns deletion status
   */
  async deleteSimSetup(): Promise<MosaikDocker.IDeleteSimSetupStatus> {
    // Path to sim setup directory that is to be deleted.
    const delSimSetupRoot = this._simSetupRoot;

    if (!delSimSetupRoot) return Promise.reject(
      `[mosaik-docker-jl] buildSimSetup() failed! \nsimulation setup directory Undefined:`
    );

    // Change to parent directory of this sim setup's root directory.
    if (undefined === this._userHomeDir) {
      await this._retrieveUserHomeDir();
    }
    const cdDir = PathExt.relative(
      delSimSetupRoot,
      this.userHomeDir
    );
    await this._fileBrowser.model.cd(cdDir);

    // Execute command 'delete_sim_setup' on the server.
    const response = await MosaikDockerAPI.sendRequest(
      'delete_sim_setup',
      'POST',
      {
        dir: delSimSetupRoot
      }
    );

    // Handle response from server.
    const code = await response.code;
    if (0 === code) {
      return Promise.resolve({
        valid: true,
        status: await response.message
      });
    } else if (1 === code) {
      return Promise.resolve({
        valid: false,
        status: await response.message
      });
    }

    // Handle errors.
    const error = await response.error;
    return Promise.reject(
      `[mosaik-docker-jl] deleteSimSetup() failed!\nerror code: ${code}\nerror: ${error}`
    );
  }

  /**
   * Start a new simulation for the currently active simulation setup.
   * @returns simulation status
   */
  async startSim(): Promise<MosaikDocker.IStartSimStatus> {
    const response = await MosaikDockerAPI.sendRequest('start_sim', 'POST', {
      dir: this._simSetupRoot
    });

    const code = await response.code;

    if (0 === code) {
      this._notifyStateChanged();
      return Promise.resolve({ status: await response.message });
    }

    const error = await response.error;

    return Promise.reject(
      `[mosaik-docker-jl] startSim() failed!\nerror code: ${code}\nerror: ${error}`
    );
  }

  /**
   * Cancel a running simulation of the currently active simulation setup.
   * @param simId - ID of the running simulation to be cancelled
   * @returns cancel status
   */
  async cancelSim(simId: string): Promise<MosaikDocker.ICancelSimStatus> {
    const response = await MosaikDockerAPI.sendRequest('cancel_sim', 'POST', {
      dir: this._simSetupRoot,
      id: simId
    });

    const code = await response.code;

    if (0 === code) {
      this._notifyStateChanged();
      return Promise.resolve({ status: await response.message });
    }

    const error = await response.error;

    return Promise.reject(
      `[mosaik-docker-jl] cancelSim() failed!\nerror code: ${code}\nerror: ${error}`
    );
  }

  /**
   * Clear a finished simulation (i.e., remove its ID from the list of
   * finished simulations).
   * @param simId - ID of the finished simulation to be cleared
   * @returns clearing status
   */
  async clearSim(simId: string): Promise<MosaikDocker.IClearSimStatus> {
    const response = await MosaikDockerAPI.sendRequest('clear_sim', 'POST', {
      dir: this._simSetupRoot,
      id: simId
    });

    const code = await response.code;

    if (0 === code) {
      this._notifyStateChanged();
      return Promise.resolve({ status: await response.message });
    }

    const error = await response.error;

    return Promise.reject(
      `[mosaik-docker-jl] clearSim() failed!\nerror code: ${code}\nerror: ${error}`
    );
  }

  /**
   * Retrieve the results of a finished simulation and store them in a
   * subfolder of the simulation setup root folder. The subfolder name
   * is the simulation ID.
   * @param simId - ID of the finished simulation for which the results are to be retrieved
   * @returns results retrieval status
   */
  async getSimResults(
    simId: string
  ): Promise<MosaikDocker.IGetSimResultsStatus> {
    const response = await MosaikDockerAPI.sendRequest(
      'get_sim_results',
      'POST',
      {
        dir: this._simSetupRoot,
        id: simId
      }
    );

    const code = await response.code;

    if (0 === code) {
      return Promise.resolve({
        status: await response.message
      });
    }

    const error = await response.error;

    return Promise.reject(
      `[mosaik-docker-jl] getSimResults() failed!\nerror code: ${code}\nerror: ${error}`
    );
  }

  /**
   * Get the IDs of all running and finished simulations for the currently
   * active simulation setup.
   * @returns IDs of all running and finished simulations
   */
  async getSimIds(): Promise<MosaikDocker.ISimIds> {
    const response = await MosaikDockerAPI.sendRequest('get_sim_ids', 'POST', {
      dir: this._simSetupRoot
    });

    const code = await response.code;

    if (0 === code) {
      const simIds = await response.message;
      return Promise.resolve({
        up: simIds.up,
        down: simIds.down
      });
    }

    const error = await response.error;

    return Promise.reject(
      `[mosaik-docker-jl] getSimIds() failed!\nerror code: ${code}\nerror: ${error}`
    );
  }

  /**
   * Inquire the status of all running and finished simulations for the
   * currently active simulation setup.
   * @returns status of all running and finished simulations
   */
  async getSimStatus(): Promise<MosaikDocker.ISimStatus> {
    const response = await MosaikDockerAPI.sendRequest(
      'get_sim_status',
      'POST',
      {
        dir: this._simSetupRoot
      }
    );

    const code = await response.code;

    if (0 === code) {
      return Promise.resolve({
        dir: this.simSetupRoot,
        status: await response.message
      });
    }

    const error = await response.error;

    return Promise.reject(
      `[mosaik-docker-jl] getSimStatus() failed!\nerror code: ${code}\nerror: ${error}`
    );
  }

  /**
   * Get the configuration data of the currently active simulation setup.
   * @returns configuration data
   */
  async getSimSetupConfigData(): Promise<MosaikDocker.IConfigData> {
    try {
      // Specify path to config file of current sim setup.
      if (undefined === this._userHomeDir) {
        await this._retrieveUserHomeDir();
      }
      const relSetupPath = PathExt.relative(this.userHomeDir, this.simSetupRoot);
      const configFilePath = PathExt.join(relSetupPath, 'mosaik-docker.json');

      // Retrieve the file from the server.
      const contentManager = new ContentsManager();
      const contentModel = await contentManager.get(configFilePath);

      // Parse the file content and return it as promise.
      const jsonData = JSON.parse(contentModel.content);

      const orchData: MosaikDocker.IOrchestratorConfigData = {
        scenarioFile: jsonData.orchestrator.scenario_file,
        dockerFile: jsonData.orchestrator.docker_file,
        extraFiles: jsonData.orchestrator.extra_files,
        extraDirs: jsonData.orchestrator.extra_dirs,
        results: jsonData.orchestrator.results
      };

      const data: MosaikDocker.IConfigData = {
        id: jsonData.id,
        orchestrator: orchData,
        simIdsUp: jsonData.sim_ids_up,
        simIdsDown: jsonData.sim_ids_down
      };

      return Promise.resolve(data);
    } catch (error) {
      return Promise.reject(
        `[mosaik-docker-jl] getSimSetupConfigData() failed!\n${error}`
      );
    }
  }

  /**
   * Display the status of all running and finished simulations for the
   * currently active simulation setup in a separate main area widget.
   */
  async displaySimStatus(): Promise<void> {
    await this._fileBrowser.model.restored;
    await this._getSimSetupRoot();

    if (!this._isValidSimSetup) {
      const path = this._simSetupRoot;
      return Promise.reject(
        `[mosaik-docker-jl] displaySimStatus() failed!\ninvalid directory:${path}`
      );
    }

    if (!this._app) return Promise.reject(
      `[mosaik-docker-jl] buildSimSetup() failed! \nstatus: front end shell not available`
    );

    if (!this._simStatusWidget.isAttached) {
      // Attach the widget to the main work area if it's not there.
      this._app.shell.add(this._simStatusWidget, 'main');
    }

    if (!this._simStatusWidgetTracker.has(this._simStatusWidget)) {
      // Track the state of the widget for later restoration
      this._simStatusWidgetTracker.add(this._simStatusWidget);
    }

    // Activate the widget.
    this._app.shell.activateById(this._simStatusWidget.id);

    const status = await this.getSimStatus();
    await this._simStatusWidget.updateStatus(status);

    return Promise.resolve();
  }

  /**
   * Display the configuration data for the currently active simulation
   * setup in a separate main area widget. Changes can be applied to the
   * simulation setup configuration.
   */
  async displaySimSetupConfiguration(): Promise<void> {
    // await this._fileBrowser.model.restored;
    // await this._getSimSetupRoot();

    if (!this._isValidSimSetup) {
      const path = this._simSetupRoot;
      return Promise.reject(
        `[mosaik-docker-jl] displaySimSetupConfiguration() failed!\ninvalid directory:${path}`
      );
    }

    const simSetupConfigureWidget = new SimSetupConfigureWidget({
      model: this,
      configData: await this.getSimSetupConfigData()
    });

    if (!this._app) return Promise.reject(
      `[mosaik-docker-jl] buildSimSetup() failed! \nstatus: front end shell not available`
    );

    // Attach the widget to the main work area.
    this._app.shell.add(simSetupConfigureWidget, 'main');

    // Activate the widget
    this._app.shell.activateById(simSetupConfigureWidget.id);

    return Promise.resolve();
  }

  /**
   * This flag indicates if the current working directory is part of a
   * valid simulation setup.
   */
  get isValidSimSetup(): boolean {
    return this._isValidSimSetup;
  }

  /**
   * Points to the root directory of the currently active simulation setup
   * (absolute path).
   */
  get simSetupRoot(): string {
    return this._simSetupRoot === undefined ? '' : this._simSetupRoot
  }

  /**
   * Points to the user's JupyterLab home directory (absolute path).
  */
 get userHomeDir(): string {
    return this._userHomeDir === undefined ? '/' : this._userHomeDir
  }

  /**
   * Signal that indicates whether the state of the extension model has changed.
   */
  get modelChanged(): ISignal<this, void> {
    return this._modelChanged;
  }

  /**
   * Get whether the model is disposed.
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * Dispose of the resources held by the model.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._isDisposed = true;
  }

  /**
   * This function is called every time the working directory changes,
   * in order to check if the working directory is (a subfolder of) a
   * valid simulation setup.
   * @private
   * @param emitter - file browser model
   */
  private async _checkIfValidSimDir(emitter: FileBrowserModel): Promise<void> {
    // Get the last status.
    const oldStatus = this._isValidSimSetup;

    // Retrieve path to the simulation setup's root directory.
    await this._getSimSetupRoot();

    // Check if the status has changed.
    if (oldStatus !== this._isValidSimSetup) {
      // If not, signal that the state has changed (activate/deactivate commands).
      this._notifyStateChanged();
    }

    return Promise.resolve();
  }

  /**
   * Try to retrieve the path to the currently active simulation setup's
   * root directory. If the current working directory is not (a subfolder
   * of) a valid simulation setup, set the validity flag to false.
   * @private
   */
  private async _getSimSetupRoot(): Promise<void> {
    const response = await MosaikDockerAPI.sendRequest(
      'get_sim_setup_root',
      'POST',
      {
        dir: this._fileBrowser.model.path
      }
    );

    const code = await response.code;

    if (0 === code) {
      this._isValidSimSetup = true;
      this._simSetupRoot = await response.message;
    } else {
      this._isValidSimSetup = false;
    }

    return Promise.resolve();
  }

  /**
   * Signal for notifying that the extension state has changed.
   * ALso update the sim status widget if it is active.
   * @private
   */
  private _notifyStateChanged(): void {
    // Emit signal that notifies that the extension state has changed.
    this._modelChanged.emit();

    // In case the sim status widget is active, update its contents.
    if (this._simStatusWidget.isAttached && this._isValidSimSetup) {
      this.displaySimStatus();
    }
  }

  /**
   * Retrieve absolute path to the user's JupyterLab home directory.
   * @private
   */
  private async _retrieveUserHomeDir(): Promise<void> {
    const response = await MosaikDockerAPI.sendRequest('get_user_home_dir');

    const code = await response.code;
    if (0 === code) {
      this._userHomeDir = await response.message;
      return Promise.resolve();
    }

    return Promise.reject(
      `[mosaik-docker-jl] getUserHomeDir() failed!\nerror code: ${code}`
    );
  }

  /// Reference to frontend application.
  private _app: JupyterFrontEnd | null;

  /// Reference to file browser extension.
  private _fileBrowser: FileBrowser;

  /// Sim status widget.
  private _simStatusWidget: SimStatusWidget;

  /// Sim status widget layout tracker.
  private _simStatusWidgetTracker: WidgetTracker;

  /// This flag indicates if the current working directory is part of a valid simulation setup.
  private _isValidSimSetup: boolean = false;

  /// Points to the root directory of the currently active simulation setup (absolute path).
  private _simSetupRoot: string | undefined = undefined;

  /// Points to the user's JupyterLab home directory (absolute path).
  private _userHomeDir: string | undefined = undefined;

  /// Signal that indicates whether the state of the extension model has changed.
  private _modelChanged: Signal<this, void>;

  /// Flag indicating whether the model has been disposed.
  private _isDisposed = false;
}
