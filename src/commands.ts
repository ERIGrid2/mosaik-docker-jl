import { JupyterFrontEnd } from '@jupyterlab/application';

import { Dialog, showDialog, showErrorMessage } from '@jupyterlab/apputils';

import { IMosaikExtension } from './tokens';

import { CommandIDs } from './command-ids';

import { SimSetupConfigureForm } from './widgets/sim-setup-configure-form';

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
  simStatusIcon
} from './style/icons';

/**
 * Add the commands for the mosaik-docker extension.
 */
export function addCommands(
  app: JupyterFrontEnd,
  model: IMosaikExtension
): void {
  app.commands.addCommand(CommandIDs.createSimSetup, {
    label: 'Create Simulation Setup',
    caption: 'Create a new mosaik-docker simulation setup.',
    isEnabled: () => !model.isValidSimSetup,
    icon: simSetupCreateIcon,
    execute: async () => {
      const result = await showDialog({
        title: 'Create a mosaik-docker simulation setup',
        body: new SimSetupCreateForm(),
        focusNodeSelector: 'input',
        buttons: [Dialog.cancelButton(), Dialog.okButton({ label: 'CREATE' })]
      });

      if (result.button.accept) {
        try {
          const create = await model.createSimSetup(result.value);
          console.log(`[${CommandIDs.createSimSetup}] ${create.status}`);
        } catch (error) {
          console.error(error);
          showErrorMessage(
            'An error occurred while attempting to create a new simulation setup!',
            error
          );
        }
      }
    }
  });

  app.commands.addCommand(CommandIDs.configureSimSetup, {
    label: 'Configure Simulation Setup',
    caption:
      'Update the configuration of an existing mosaik-docker simulation setup.',
    isEnabled: () => model.isValidSimSetup,
    icon: simSetupConfigIcon,
    execute: async () => {
      const configData = await model.getSimSetupConfigData();

      const result = await showDialog({
        title: 'Configure Simulation Setup',
        body: new SimSetupConfigureForm(configData),
        focusNodeSelector: 'input',
        buttons: [
          Dialog.cancelButton(),
          Dialog.okButton({ label: 'CONFIGURE' })
        ]
      });

      if (result.button.accept) {
        try {
          const config = await model.configureSimSetup(
            result.value.scenarioFile,
            result.value.dockerFile,
            result.value.extraFiles,
            result.value.extraDirs,
            result.value.results
          );
          console.log(`[${CommandIDs.configureSimSetup}] ${config.status}`);
        } catch (error) {
          console.error(error);
          showErrorMessage(
            'An error occurred while attempting to configure the simulation setup!',
            error
          );
        }
      }
    }
  });

  app.commands.addCommand(CommandIDs.checkSimSetup, {
    label: 'Check Simulation Setup',
    caption: 'Check if mosaik-docker simulation setup is valid.',
    isEnabled: () => model.isValidSimSetup,
    icon: simSetupCheckIcon,
    execute: async () => {
      try {
        const check = await model.checkSimSetup();
        console.log(`[${CommandIDs.checkSimSetup}] ${check.status}`);

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
          error
        );
      }
    }
  });

  app.commands.addCommand(CommandIDs.buildSimSetup, {
    label: 'Build Simulation Setup',
    caption: 'Build mosaik-docker simulation setup.',
    isEnabled: () => model.isValidSimSetup,
    icon: simSetupBuildIcon,
    execute: async () => {
      try {
        await model.buildSimSetup();
      } catch (error) {
        console.error(error);
        showErrorMessage(
          'An error occurred while attempting to build the simulation setup!',
          error
        );
      }
    }
  });

  app.commands.addCommand(CommandIDs.startSim, {
    label: 'Start Simulation',
    caption: 'Start a new mosaik-docker simulation.',
    isEnabled: () => model.isValidSimSetup,
    icon: simStartIcon,
    execute: async () => {
      try {
        const start = await model.startSim();
        console.log(`[${CommandIDs.startSim}] ${start.status}`);

        showDialog({
          title: 'Simulation started',
          body: start.status,
          buttons: [Dialog.cancelButton({ label: 'OK' })]
        });
      } catch (error) {
        console.error(error);
        showErrorMessage(
          'An error occurred while attempting to start a simulation!',
          error
        );
      }
    }
  });

  app.commands.addCommand(CommandIDs.cancelSim, {
    label: 'Cancel Simulation',
    caption: 'Cancel a mosaik-docker simulation.',
    isEnabled: () => model.isValidSimSetup,
    icon: simCancelIcon,
    execute: async () => {
      try {
        const simIds = await model.getSimIds();
        const simIdsUp = await simIds.up;

        if (0 === simIdsUp.length) {
          showDialog({
            title: 'Cancel simulation',
            body: 'No running simulations found',
            buttons: [Dialog.cancelButton({ label: 'OK' })]
          });

          return;
        }

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

        if (result.button.accept) {
          const cancelId = result.value.selectAll
            ? 'all'
            : result.value.selectItem;
          const cancel = await model.cancelSim(cancelId);
          console.log(`[${CommandIDs.cancelSim}] ${cancel.status}`);
        }
      } catch (error) {
        console.error(error);
        showErrorMessage(
          'An error occurred while attempting to cancel a simulation!',
          error
        );
      }
    }
  });

  app.commands.addCommand(CommandIDs.clearSim, {
    label: 'Clear Simulation',
    caption: 'Clear a mosaik-docker simulation.',
    isEnabled: () => model.isValidSimSetup,
    icon: simClearIcon,
    execute: async () => {
      try {
        const simIds = await model.getSimIds();
        const simIdsDown = await simIds.down;

        if (0 === simIdsDown.length) {
          showDialog({
            title: 'Clear simulation',
            body: 'No finished simulations found',
            buttons: [Dialog.cancelButton({ label: 'OK' })]
          });

          return;
        }

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

        if (result.button.accept) {
          const clearId = result.value.selectAll
            ? 'all'
            : result.value.selectItem;
          const clear = await model.clearSim(clearId);
          console.log(`[${CommandIDs.clearSim}] ${clear.status}`);
        }
      } catch (error) {
        console.error(error);
        showErrorMessage(
          'An error occurred while attempting to clear a simulation!',
          error
        );
      }
    }
  });

  app.commands.addCommand(CommandIDs.getSimResults, {
    label: 'Get Simulation Results',
    caption: 'Retrieve the simulation results of a mosaik-docker simulation.',
    isEnabled: () => model.isValidSimSetup,
    icon: simResultsIcon,
    execute: async () => {
      try {
        const simIds = await model.getSimIds();
        const simIdsDown = await simIds.down;

        if (0 === simIdsDown.length) {
          showDialog({
            title: 'Get simulation results',
            body: 'No finished simulations found',
            buttons: [Dialog.cancelButton({ label: 'OK' })]
          });

          return;
        }

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

        if (result.button.accept) {
          const getResultsId = result.value.selectAll
            ? 'all'
            : result.value.selectItem;
          const getResults = await model.getSimResults(getResultsId);
          console.log(`[${CommandIDs.getSimResults}] ${getResults.status}`);
        }
      } catch (error) {
        console.error(error);
        showErrorMessage(
          'An error occurred while attempting to get the simulation results!',
          error
        );
      }
    }
  });

  app.commands.addCommand(CommandIDs.getSimStatus, {
    label: 'Check Simulation Status',
    caption: 'Check the status of all simulations of a mosaik-docker setup.',
    isEnabled: () => model.isValidSimSetup,
    icon: simStatusIcon,
    execute: async args => {
      const suppressError: boolean =
        typeof args['suppressError'] === 'undefined' ? false : true;

      try {
        await model.displaySimStatus();
      } catch (error) {
        console.error(error);
        if (!suppressError) {
          showErrorMessage(
            'An error occurred while attempting to display the simulation status!',
            error
          );
        }
      }
    }
  });

  app.commands.addCommand(CommandIDs.deleteSimSetup, {
    label: 'Delete Simulation Setup',
    caption:
      'Delete a simulation setup, including all associated Docker images and containers.',
    isEnabled: () => model.isValidSimSetup,
    icon: simSetupDeleteIcon,
    execute: async () => {
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

      if (result.button.accept) {
        try {
          const del = await model.deleteSimSetup();
          console.log(`[${CommandIDs.deleteSimSetup}] ${del.status}`);
        } catch (error) {
          console.error(error);
          showErrorMessage(
            'An error occurred while attempting to delete the simulation setup!',
            error
          );
        }
      }
    }
  });
}
