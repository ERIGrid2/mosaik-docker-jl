import { Token } from '@lumino/coreutils';

import { IDisposable } from '@lumino/disposable';

import { ISignal } from '@lumino/signaling';

// Provide the compile-time type of the extension's interface in way that can be used at runtime in a type-safe fashion.
export const EXTENSION_ID = 'jupyter.extensions.mosaik_docker';
export const IMosaikDockerExtension = new Token<IMosaikDockerExtension>(
  EXTENSION_ID
);

/**
 * Interface for mosaik-docker extension model.
 * The model is supposed to act on the currently activated simulation setup.
 * A simulation setup is activated by navigating to it with the help of the
 * file browser (i.e., the simulation setup's root folder or one of its
 * subfolders is the current working directory).
 */
export interface IMosaikDockerExtension extends IDisposable {
  /**
   * Retrieve the installed version of the extension.
   * @returns version information
   */
  getVersion(): Promise<MosaikDocker.IVersion>;

  /**
   * Create a new simulation setup in the current working directory.
   * @param name - name of new simulation setup
   * @returns creation status
   */
  createSimSetup(name: string): Promise<MosaikDocker.ICreateSimSetupStatus>;

  /**
   * Configure a simulation setup.
   * @param data - simulation setup configuration data
   * @param dir - path to simulation setup (active simulation setup if not specified)
   * @returns configuration status
   */
  configureSimSetup(
    data: MosaikDocker.IOrchestratorConfigData,
    dir?: string
  ): Promise<MosaikDocker.IConfigureSimSetupStatus>;

  /**
   * Build currently active simulation setup.
   */
  buildSimSetup(): Promise<void>;

  /**
   * Check currently active simulation setup.
   * @returns check status
   */
  checkSimSetup(): Promise<MosaikDocker.ICheckSimSetupStatus>;

  /**
   * Delete currently active simulation setup.
   * @returns deletion status
   */
  deleteSimSetup(): Promise<MosaikDocker.IDeleteSimSetupStatus>;

  /**
   * Start a new simulation for the currently active simulation setup.
   * @returns simulation status
   */
  startSim(): Promise<MosaikDocker.IStartSimStatus>;

  /**
   * Cancel a running simulation of the currently active simulation setup.
   * @param simId - ID of the running simulation to be cancelled
   * @returns cancel status
   */
  cancelSim(simId: string): Promise<MosaikDocker.ICancelSimStatus>;

  /**
   * Clear a finished simulation (i.e., remove its ID from the list of
   * finished simulations).
   * @param simId - ID of the finished simulation to be cleared
   * @returns clearing status
   */
  clearSim(simId: string): Promise<MosaikDocker.IClearSimStatus>;

  /**
   * Retrieve the results of a finished simulation and store them in a
   * subfolder of the simulation setup root folder. The subfolder name
   * is the simulation ID.
   * @param simId - ID of the finished simulation for which the results are to be retrieved
   * @returns results retrieval status
   */
  getSimResults(simId: string): Promise<MosaikDocker.IGetSimResultsStatus>;

  /**
   * Get the IDs of all running and finished simulations for the currently
   * active simulation setup.
   * @returns IDs of all running and finished simulations
   */
  getSimIds(): Promise<MosaikDocker.ISimIds>;

  /**
   * Inquire the status of all running and finished simulations for the
   * currently active simulation setup.
   * @returns status of all running and finished simulations
   */
  getSimStatus(): Promise<MosaikDocker.ISimStatus>;

  /**
   * Get the configuration data of the currently active simulation setup.
   * @returns configuration data
   */
  getSimSetupConfigData(): Promise<MosaikDocker.IConfigData>;

  /**
   * Display the status of all running and finished simulations for the
   * currently active simulation setup in a separate main area widget.
   */
  displaySimStatus(): Promise<void>;

  /**
   * Display the configuration data for the currently active simulation
   * setup in a separate main area widget. Changes can be applied to the
   * simulation setup configuration.
   */
  displaySimSetupConfiguration(): Promise<void>;

  /**
   * This flag indicates if the current working directory is part of a
   * valid simulation setup.
   */
  readonly isValidSimSetup: boolean;

  /**
   * Points to the root directory of the currently active simulation setup
   * (absolute path).
   */
  readonly simSetupRoot: string;

  /**
   * Points to the user's JupyterLab home directory (absolute path).
   */
  readonly userHomeDir: string;

  /**
   * Signal that indicates whether the state of the extension model has changed.
   */
  readonly modelChanged: ISignal<this, void>;
}

/**
 * This namespace contains the definitions for all data structures and return
 * types for the mosaik-docker extension interface.
 */
export namespace MosaikDocker {
  /**
   * Return type for retrieving the extension's version from the server.
   */
  export interface IVersion {
    version: string;
  }

  /**
   * Return type for creating simulation setups.
   */
  export interface ICreateSimSetupStatus {
    status: string;
  }

  /**
   * Return type for configuring simulation setups.
   */
  export interface IConfigureSimSetupStatus {
    status: string;
  }

  /**
   * Return type for checking simulation setups.
   */
  export interface ICheckSimSetupStatus {
    valid: boolean;
    status: string;
  }

  /**
   * Return type for deleting simulation setups.
   */
  export interface IDeleteSimSetupStatus {
    valid: boolean;
    status: string;
  }

  /**
   * Return type for starting simulations.
   */
  export interface IStartSimStatus {
    status: string;
  }

  /**
   * Return type for cancelling simulations.
   */
  export interface ICancelSimStatus {
    status: string;
  }

  /**
   * Return type for clearing simulations.
   */
  export interface IClearSimStatus {
    status: string;
  }

  /**
   * Return type for retrieving simulation results.
   */
  export interface IGetSimResultsStatus {
    status: string;
  }

  /**
   * Return type for retrieving the status of a setup's simulations.
   */
  export interface ISimStatus {
    dir: string;
    status: {
      up: object;
      down: object;
    };
  }

  /**
   * Return type for retrieving the IDs of a setup's simulations.
   */
  export interface ISimIds {
    up: string[];
    down: string[];
  }

  /**
   * Interface defining the configuration data for the orchestrator
   * container of a simulation setup.
   */
  export interface IOrchestratorConfigData {
    scenarioFile: string;
    dockerFile: string;
    extraFiles: Array<string>;
    extraDirs: Array<string>;
    results: Array<string>;
  }

  /**
   * Interface defining the complete configuration data of a simulation setup.
   */
  export interface IConfigData {
    id: string;
    orchestrator: IOrchestratorConfigData;
    simIdsUp: Array<string>;
    simIdsDown: Array<string>;
  }
}
