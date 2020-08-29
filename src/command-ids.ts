/**
 * The IDs of the mosaik-docker-jl commands that are exposed to the user (main menu, sim tab, etc.).
 */
export namespace CommandIDs {
  /** Command ID for creating new simulation setups. */
  export const createSimSetup = 'mosaik-docker-jl:create-sim-setup';

  /** Command ID for configuring simulation setups. */
  export const configureSimSetup = 'mosaik-docker-jl:configure-sim-setup';

  /** Command ID for checking simulation setups. */
  export const checkSimSetup = 'mosaik-docker-jl:check-sim-setup';

  /** Command ID for building simulation setups. */
  export const buildSimSetup = 'mosaik-docker-jl:build-sim-setup';

  /** Command ID for starting a new simulation. */
  export const startSim = 'mosaik-docker-jl:start-sim';

  /** Command ID for canceling a simulation. */
  export const cancelSim = 'mosaik-docker-jl:cancel-sim';

  /** Command ID for clearing a new simulation. */
  export const clearSim = 'mosaik-docker-jl:clear-sim';

  /** Command ID for retrieving the status of all simulations of a simulation setup. */
  export const getSimStatus = 'mosaik-docker-jl:get-sim-status';

  /** Command ID for retrieving the results of simulations. */
  export const getSimResults = 'mosaik-docker-jl:get-sim-results';

  /** Command ID for deleting simulation setups. */
  export const deleteSimSetup = 'mosaik-docker-jl:delete-sim-setup';

  /** For convenience, put all command IDs in a single list. */
  export const all = [
    createSimSetup,
    configureSimSetup,
    checkSimSetup,
    buildSimSetup,
    startSim,
    cancelSim,
    clearSim,
    getSimStatus,
    getSimResults,
    deleteSimSetup
  ];

  /** Additional command ID for opening the mosaik-docker documentation. */
  export const openMosaikDockerDocs =
    'mosaik-docker-jl:open-mosaik-docker-docs';

  /** Additional command ID for opening the JupyterLab mosaik-docker extension documentation. */
  export const openMosaikDockerJLDocs =
    'mosaik-docker-jl:open-mosaik-docker-jl-docs';

  /** Additional command ID for opening the mosaik-docker CLI documentation. */
  export const openMosaikDockerCliDocs =
    'mosaik-docker-jl:open-mosaik-docker-cli-docs';

  /** Additional command ID for opening the mosaik-docker Python documentation. */
  export const openMosaikDockerPyDocs =
    'mosaik-docker-jl:open-mosaik-docker-py-docs';

  /** For convenience, put all additional command IDs for opening documentation in a single list. */
  export const docs = [
    openMosaikDockerDocs,
    openMosaikDockerJLDocs,
    openMosaikDockerCliDocs,
    openMosaikDockerPyDocs
  ];
}
