import { JupyterFrontEnd } from '@jupyterlab/application';

import { Dialog, showDialog, showErrorMessage } from '@jupyterlab/apputils';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { IMosaikDockerExtension } from './tokens';

import { CommandIDs } from './command-ids';

import { SimSetupCreateForm } from './widgets/sim-setup-create-form';

import { SimSelectForm } from './widgets/sim-select-form';

import {
  simSetupBuildIcon,
  simSetupCheckIcon,
  simSetupDeleteIcon,
  simSetupConfigIcon,
  simSetupCreateIcon,
  simCancelIcon,
  simClearIcon,
  simResultsIcon,
  simStartIcon,
  simStatusIcon,
  mosaikDockerLauncherIcon,
  mosaikDockerCliIcon,
  mosaikDockerJlIcon,
  mosaikDockerPyIcon
} from './style/icons';

/**
 * Add the mosaik-docker-jl commands that are exposed to the user (main menu, sim tab, etc.).
 * @param app - JupyterLab frontend
 * @param model - mosaik-docker extension model
 * @param settings - mosaik-docker extension settings
 */
export function addCommands(
  app: JupyterFrontEnd,
  model: IMosaikDockerExtension,
  settings: ISettingRegistry.ISettings
): void {
  // Add command for creating new simulation setups.
  // Only enable this functions if the current working
  // directory IS NOT (a subfolder of) a simulation setup.
  app.commands.addCommand(CommandIDs.createSimSetup, {
    label: 'Create Simulation Setup',
    caption: 'Create a new mosaik-docker simulation setup.',
    isEnabled: () => !model.isValidSimSetup,
    icon: simSetupCreateIcon,
    execute: async () => {
      // Input dialog asking for the name of the new simulation setup.
      const result = await showDialog({
        title: 'Create a new mosaik-docker simulation setup',
        body: new SimSetupCreateForm(),
        focusNodeSelector: 'input',
        buttons: [Dialog.cancelButton(), Dialog.okButton({ label: 'CREATE' })]
      });

      // Retrieve simulation setup name.
      if (result.button.accept) {
        try {
          if (result.value) {
            // Attempt to create a new simulation setup.
            const create = await model.createSimSetup(result.value);
            console.log(`[${CommandIDs.createSimSetup}] ${create.status}`);
          } else {
            throw new Error('simulation setup name undefined');
          }
        } catch (error) {
          console.error(error);
          showErrorMessage(
            'An error occurred while attempting to create a new simulation setup!',
            String(error)
          );
        }
      }
    }
  });

  // Add command for configuring simulation setups.
  // Only enable this functions if the current working
  // directory IS (a subfolder of) a simulation setup.
  app.commands.addCommand(CommandIDs.configureSimSetup, {
    label: 'Configure Simulation Setup',
    caption:
      'Update the configuration of an existing mosaik-docker simulation setup.',
    isEnabled: () => model.isValidSimSetup,
    icon: simSetupConfigIcon,
    execute: async () => {
      try {
        // Display the simulation setup configuration in a main area widget.
        await model.displaySimSetupConfiguration();
      } catch (error) {
        console.error(error);
      }
    }
  });

  // Add command for checking simulation setups.
  // Only enable this functions if the current working
  // directory IS (a subfolder of) a simulation setup.
  app.commands.addCommand(CommandIDs.checkSimSetup, {
    label: 'Check Simulation Setup',
    caption: 'Check if mosaik-docker simulation setup is valid.',
    isEnabled: () => model.isValidSimSetup,
    icon: simSetupCheckIcon,
    execute: async () => {
      try {
        // Check the simulation setup.
        const check = await model.checkSimSetup();
        console.log(`[${CommandIDs.checkSimSetup}] ${check.status}`);

        // Show a dialog with the check result.
        if (true === check.valid) {
          showDialog({
            title: 'Simulation setup is valid!',
            buttons: [Dialog.cancelButton({ label: 'OK' })]
          });
        } else {
          showErrorMessage('Simulation setup is invalid', check.status);
        }
      } catch (error) {
        console.error(error);
        showErrorMessage(
          'An error occurred while attempting to check the simulation setup!',
          String(error)
        );
      }
    }
  });

  // Add command for building simulation setups.
  // Only enable this functions if the current working
  // directory IS (a subfolder of) a simulation setup.
  app.commands.addCommand(CommandIDs.buildSimSetup, {
    label: 'Build Simulation Setup',
    caption: 'Build mosaik-docker simulation setup.',
    isEnabled: () => model.isValidSimSetup,
    icon: simSetupBuildIcon,
    execute: async () => {
      try {
        // Display the building status in a main area widget.
        await model.buildSimSetup();
      } catch (error) {
        console.error(error);
        showErrorMessage(
          'An error occurred while attempting to build the simulation setup!',
          String(error)
        );
      }
    }
  });

  // Add command for starting a new simulation.
  // Only enable this functions if the current working
  // directory IS (a subfolder of) a simulation setup.
  app.commands.addCommand(CommandIDs.startSim, {
    label: 'Start Simulation',
    caption: 'Start a new mosaik-docker simulation.',
    isEnabled: () => model.isValidSimSetup,
    icon: simStartIcon,
    execute: async () => {
      try {
        // Start a new simulation.
        const start = await model.startSim();
        console.log(`[${CommandIDs.startSim}] ${start.status}`);

        // Display a dialog with the status.
        showDialog({
          title: 'Simulation started',
          body: start.status,
          buttons: [Dialog.cancelButton({ label: 'OK' })]
        });
      } catch (error) {
        console.error(error);
        showErrorMessage(
          'An error occurred while attempting to start a simulation!',
          String(error)
        );
      }
    }
  });

  // Add command for canceling a simulation.
  // Only enable this functions if the current working
  // directory IS (a subfolder of) a simulation setup.
  app.commands.addCommand(CommandIDs.cancelSim, {
    label: 'Cancel Simulation',
    caption: 'Cancel a mosaik-docker simulation.',
    isEnabled: () => model.isValidSimSetup,
    icon: simCancelIcon,
    execute: async () => {
      try {
        // Retrieve simulation IDs of running simulations (status 'UP').
        const simIds = await model.getSimIds();
        const simIdsUp = await simIds.up;

        // Notify the user in case no running simulations habe been found.
        if (0 === simIdsUp.length) {
          showDialog({
            title: 'Cancel simulation',
            body: 'No running simulations found',
            buttons: [Dialog.cancelButton({ label: 'OK' })]
          });
          return;
        }

        // Let the user select one ID or all for cancelling.
        const result = await showDialog({
          title: 'Cancel simulation',
          body: new SimSelectForm({
            textSelectAll: 'Cancel all running simulations?',
            textSelectItem: 'Select simulation ID:',
            items: simIdsUp
          }),
          focusNodeSelector: 'select',
          buttons: [Dialog.cancelButton(), Dialog.okButton()]
        });

        // Cancel the selected simulation(s).
        if (result.button.accept) {
          if (!result.value) throw new Error("simulation ID undefined");

          const cancelId = result.value.selectAll
            ? 'all'
            : result.value.selectItem;

          if (!cancelId) throw new Error("invalid selection");

          const cancel = await model.cancelSim(String(cancelId));
          console.log(`[${CommandIDs.cancelSim}] ${cancel.status}`);
        }
      } catch (error) {
        console.error(error);
        showErrorMessage(
          'An error occurred while attempting to cancel a simulation!',
          String(error)
        );
      }
    }
  });

  // Add command for clearing a new simulation.
  // Only enable this functions if the current working
  // directory IS (a subfolder of) a simulation setup.
  app.commands.addCommand(CommandIDs.clearSim, {
    label: 'Clear Simulation',
    caption: 'Clear a mosaik-docker simulation.',
    isEnabled: () => model.isValidSimSetup,
    icon: simClearIcon,
    execute: async () => {
      try {
        // Retrieve simulation IDs of finished simulations (status 'DOWN').
        const simIds = await model.getSimIds();
        const simIdsDown = await simIds.down;

        // Notify the user in case no finished simulations habe been found.
        if (0 === simIdsDown.length) {
          showDialog({
            title: 'Clear simulation',
            body: 'No finished simulations found',
            buttons: [Dialog.cancelButton({ label: 'OK' })]
          });
          return;
        }

        // Let the user select one ID or all for clearing.
        const result = await showDialog({
          title: 'Clear simulation',
          body: new SimSelectForm({
            textSelectAll: 'Clear all finished simulations?',
            textSelectItem: 'Select simulation ID:',
            items: simIdsDown
          }),
          focusNodeSelector: 'select',
          buttons: [Dialog.cancelButton(), Dialog.okButton()]
        });

        // Clear the selected simulation(s).
        if (result.button.accept) {
          if (!result.value) throw new Error("simulation ID undefined");

          const clearId = result.value.selectAll
            ? 'all'
            : result.value.selectItem;

          if (!clearId) throw new Error("invalid selection")

          const clear = await model.clearSim(clearId);
          console.log(`[${CommandIDs.clearSim}] ${clear.status}`);
        }
      } catch (error) {
        console.error(error);
        showErrorMessage(
          'An error occurred while attempting to clear a simulation!',
          String(error)
        );
      }
    }
  });

  // Add command for retrieving the results of simulations.
  // Only enable this functions if the current working
  // directory IS (a subfolder of) a simulation setup.
  app.commands.addCommand(CommandIDs.getSimResults, {
    label: 'Get Simulation Results',
    caption: 'Retrieve the simulation results of a mosaik-docker simulation.',
    isEnabled: () => model.isValidSimSetup,
    icon: simResultsIcon,
    execute: async () => {
      try {
        // Retrieve simulation IDs of finished simulations (status 'DOWN').
        const simIds = await model.getSimIds();
        const simIdsDown = await simIds.down;

        // Notify the user in case no finished simulations habe been found.
        if (0 === simIdsDown.length) {
          showDialog({
            title: 'Get simulation results',
            body: 'No finished simulations found',
            buttons: [Dialog.cancelButton({ label: 'OK' })]
          });
          return;
        }

        // Let the user select one ID or all for retrieving results.
        const result = await showDialog({
          title: 'Get simulation results',
          body: new SimSelectForm({
            textSelectAll: 'Get results of all finished simulations?',
            textSelectItem: 'Select simulation ID:',
            items: simIdsDown
          }),
          focusNodeSelector: 'select',
          buttons: [Dialog.cancelButton(), Dialog.okButton()]
        });

        // Retrieve the results of selected simulation(s).
        if (result.button.accept) {
          if (!result.value) throw new Error("simulation ID undefined");

          const getResultsId = result.value.selectAll
            ? 'all'
            : result.value.selectItem;

          if (!getResultsId) throw new Error("invalid selection");

          const getResults = await model.getSimResults(getResultsId);
          console.log(`[${CommandIDs.getSimResults}] ${getResults.status}`);
        }
      } catch (error) {
        console.error(error);
        showErrorMessage(
          'An error occurred while attempting to get the simulation results!',
          String(error)
        );
      }
    }
  });

  // Add command for retrieving the status of all simulations
  // of a simulation setup. Only enable this functions if the
  // current working directory IS (a subfolder of) a simulation
  // setup.
  // The corresponding widget may be restored when JupyterLab
  // is started, even though no simulation setup is currently
  // activated. In such case, the error message can be suppressed.
  app.commands.addCommand(CommandIDs.getSimStatus, {
    label: 'Check Simulation Status',
    caption: 'Check the status of all simulations of a mosaik-docker setup.',
    isEnabled: () => model.isValidSimSetup,
    icon: simStatusIcon,
    execute: async args => {
      // Check if potential error message should be suppressed.
      const suppressError: boolean =
        typeof args['suppressError'] === 'undefined' ? false : true;

      try {
        // Display the status of all simulations of the currently
        // activated simulation setup in a main area widget.
        await model.displaySimStatus();
      } catch (error) {
        console.error(error);
        if (!suppressError) {
          showErrorMessage(
            'An error occurred while attempting to display the simulation status!',
            String(error)
          );
        }
      }
    }
  });

  // Add command for deleting simulation setups.
  // Only enable this functions if the current working
  // directory IS (a subfolder of) a simulation setup.
  app.commands.addCommand(CommandIDs.deleteSimSetup, {
    label: 'Delete Simulation Setup',
    caption:
      'Delete a simulation setup, including all associated Docker images and containers.',
    isEnabled: () => model.isValidSimSetup,
    icon: simSetupDeleteIcon,
    execute: async () => {
      // Show a dialog in which the user has to confirm the choice
      // to delete the currently activated simulation setup.
      const result = await showDialog({
        title: 'Delete Simulation Setup',
        body: `Do you really want to delete this simulation setup?\n${
          model.simSetupRoot
        }`,
        buttons: [
          Dialog.cancelButton(),
          Dialog.okButton({ label: 'DELETE SETUP' })
        ]
      });

      // Check the user's choice.
      if (result.button.accept) {
        try {
          // Delete the currently activated simulation setup.
          const del = await model.deleteSimSetup();
          console.log(`[${CommandIDs.deleteSimSetup}] ${del.status}`);
        } catch (error) {
          console.error(error);
          showErrorMessage(
            'An error occurred while attempting to delete the simulation setup!',
            String(error)
          );
        }
      }
    }
  });

  // Add command for opening the mosaik-docker documentation.
  app.commands.addCommand(CommandIDs.openMosaikDockerDocs, {
    label: 'Documentation',
    caption: 'Open mosaik-docker documentation',
    icon: mosaikDockerLauncherIcon,
    execute: () => {
      window.open(settings.composite['mosaikDockerDocsUrl'] as string);
    }
  });

  // Add command for opening the JupyterLab mosaik-docker extension documentation.
  app.commands.addCommand(CommandIDs.openMosaikDockerJLDocs, {
    label: 'JupyterLab Reference',
    caption: 'Reference for using mosaik-docker with the JupyterLab GUI',
    icon: mosaikDockerJlIcon,
    execute: () => {
      window.open(settings.composite['mosaikDockerJLDocsUrl'] as string);
    }
  });

  // Add command for opening the mosaik-docker CLI documentation.
  app.commands.addCommand(CommandIDs.openMosaikDockerCliDocs, {
    label: 'Command Line Reference',
    caption: 'Reference for using mosaik-docker from the command line',
    icon: mosaikDockerCliIcon,
    execute: () => {
      window.open(settings.composite['mosaikDockerCliDocsUrl'] as string);
    }
  });

  // Add command for opening the mosaik-docker Python documentation.
  app.commands.addCommand(CommandIDs.openMosaikDockerPyDocs, {
    label: 'Python Reference',
    caption: 'Reference for using mosaik-docker with Python scripts',
    icon: mosaikDockerPyIcon,
    execute: () => {
      window.open(settings.composite['mosaikDockerPyDocsUrl'] as string);
    }
  });
}
