import {
  Token
} from '@lumino/coreutils';

import {
  IDisposable
} from '@lumino/disposable';

import {
  ISignal
} from '@lumino/signaling';


export const EXTENSION_ID = 'jupyter.extensions.mosaik_docker_plugin';


// tslint:disable-next-line: variable-name
export const IMosaikExtension = new Token<IMosaikExtension>( EXTENSION_ID );


/** Interface for extension class */
export interface IMosaikExtension extends IDisposable {

  getVersion(): Promise<MosaikDockerSim.Version>;

  createSimSetup(
    name: string
  ): Promise<MosaikDockerSim.CreateSimSetupStatus>;


  configureSimSetup(
    scenarioFile: string,
    dockerFile: string,
    extraFiles: Array<string>,
    extraDirs: Array<string>,
    results: Array<string>
  ): Promise<MosaikDockerSim.CreateSimSetupStatus>;


  buildSimSetup(): Promise<void>;

  checkSimSetup(): Promise<MosaikDockerSim.CheckSimSetupStatus>;

  deleteSimSetup(): Promise<MosaikDockerSim.DeleteSimSetupStatus>;  

  startSim(): Promise<MosaikDockerSim.StartSimStatus>;


  cancelSim(
    simId: string
  ): Promise<MosaikDockerSim.CancelSimStatus>;

  clearSim(
    simId: string
  ): Promise<MosaikDockerSim.ClearSimStatus>;

  getSimResults(
    simId: string
  ): Promise<MosaikDockerSim.GetSimResultsStatus>;

  getSimIds(): Promise<MosaikDockerSim.SimIds>;

  /**
   * Inquire simulation status.
   */
  getSimStatus(): Promise<MosaikDockerSim.SimStatus>;


  displaySimStatus(): Promise<void>;
  

  readonly isValidSimSetup: boolean;

  readonly simSetupRoot: string;

  readonly userHomeDir: string;

  readonly stateChanged: ISignal<this, void>;
}


export namespace MosaikDockerSim {

  export interface APIResponse {
    code: number;
    message?: any;
    error?: string;
  }

  export interface ExecuteResponse {
    status: string;
    error?: string;
  }

  export interface Version {
    version: string;
  }

  export interface CreateSimSetupStatus {
    status: string;
  }

  export interface ConfigureSimSetupStatus {
    status: string;
  }

  export interface CheckSimSetupStatus {
    valid: boolean;
    status: string;
  }

  export interface DeleteSimSetupStatus {
    valid: boolean;
    status: string;
  }

  export interface StartSimStatus {
    status: string;
  }

  export interface CancelSimStatus {
    status: string;
  }

  export interface ClearSimStatus {
    status: string;
  }

  export interface GetSimResultsStatus {
    status: string;
  }

  export interface SimStatus {
    dir: string;
    status: { 
      up: object, 
      down: object 
    };
  }

  export interface SimIds {
    up: string[];
    down: string[];
  }
}
