import { Token } from '@lumino/coreutils';

import { IDisposable } from '@lumino/disposable';

import { ISignal } from '@lumino/signaling';

export const EXTENSION_ID = 'jupyter.extensions.mosaik_docker_plugin';

// tslint:disable-next-line: variable-name
export const IMosaikExtension = new Token<IMosaikExtension>(EXTENSION_ID);

/** Interface for extension class */
export interface IMosaikExtension extends IDisposable {
  getVersion(): Promise<MosaikDockerSim.IVersion>;

  createSimSetup(name: string): Promise<MosaikDockerSim.ICreateSimSetupStatus>;

  configureSimSetup(
    data: MosaikDockerSim.IOrchestratorConfigData,
    dir?: string
  ): Promise<MosaikDockerSim.ICreateSimSetupStatus>;

  buildSimSetup(): Promise<void>;

  checkSimSetup(): Promise<MosaikDockerSim.ICheckSimSetupStatus>;

  deleteSimSetup(): Promise<MosaikDockerSim.IDeleteSimSetupStatus>;

  startSim(): Promise<MosaikDockerSim.IStartSimStatus>;

  cancelSim(simId: string): Promise<MosaikDockerSim.ICancelSimStatus>;

  clearSim(simId: string): Promise<MosaikDockerSim.IClearSimStatus>;

  getSimResults(simId: string): Promise<MosaikDockerSim.IGetSimResultsStatus>;

  getSimIds(): Promise<MosaikDockerSim.ISimIds>;

  /**
   * Inquire simulation status.
   */
  getSimStatus(): Promise<MosaikDockerSim.ISimStatus>;

  displaySimStatus(): Promise<void>;

  displaySimSetupConfiguration(): Promise<void>;

  getSimSetupConfigData(): Promise<MosaikDockerSim.IConfigData>;

  readonly isValidSimSetup: boolean;

  readonly simSetupRoot: string;

  readonly userHomeDir: string;

  readonly stateChanged: ISignal<this, void>;
}

export namespace MosaikDockerSim {
  export interface IAPIResponse {
    code: number;
    message?: any;
    error?: string;
  }

  export interface IExecuteResponse {
    status: string;
    error?: string;
  }

  export interface IVersion {
    version: string;
  }

  export interface ICreateSimSetupStatus {
    status: string;
  }

  export interface IConfigureSimSetupStatus {
    status: string;
  }

  export interface ICheckSimSetupStatus {
    valid: boolean;
    status: string;
  }

  export interface IDeleteSimSetupStatus {
    valid: boolean;
    status: string;
  }

  export interface IStartSimStatus {
    status: string;
  }

  export interface ICancelSimStatus {
    status: string;
  }

  export interface IClearSimStatus {
    status: string;
  }

  export interface IGetSimResultsStatus {
    status: string;
  }

  export interface ISimStatus {
    dir: string;
    status: {
      up: object;
      down: object;
    };
  }

  export interface ISimIds {
    up: string[];
    down: string[];
  }

  export interface IOrchestratorConfigData {
    scenarioFile: string;
    dockerFile: string;
    extraFiles: Array<string>;
    extraDirs: Array<string>;
    results: Array<string>;
  }

  export interface IConfigData {
    id: string;
    orchestrator: IOrchestratorConfigData;
    simIdsUp: Array<string>;
    simIdsDown: Array<string>;
  }
}
