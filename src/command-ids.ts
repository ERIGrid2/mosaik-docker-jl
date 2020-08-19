/**
 * The command IDs used by the mosaik-docker plugin.
 */
export namespace CommandIDs {
  export const createSimSetup = 'mosaik-docker-jl:create-sim-setup';
  export const configureSimSetup = 'mosaik-docker-jl:configure-sim-setup';
  export const checkSimSetup = 'mosaik-docker-jl:check-sim-setup';
  export const buildSimSetup = 'mosaik-docker-jl:build-sim-setup';
  export const startSim = 'mosaik-docker-jl:start-sim';
  export const cancelSim = 'mosaik-docker-jl:cancel-sim';
  export const clearSim = 'mosaik-docker-jl:clear-sim';
  export const getSimStatus = 'mosaik-docker-jl:get-sim-status';
  export const getSimResults = 'mosaik-docker-jl:get-sim-results';
  export const deleteSimSetup = 'mosaik-docker-jl:delete-sim-setup';

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
}
