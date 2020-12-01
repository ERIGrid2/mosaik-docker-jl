import { JupyterFrontEnd } from '@jupyterlab/application';

import { Dialog, ToolbarButton, showDialog } from '@jupyterlab/apputils';

import { FileBrowser } from '@jupyterlab/filebrowser';

import { IMosaikDockerExtension } from '../tokens';

import { CommandIDs } from '../command-ids';

import { buttonSimSetupCreateIcon } from '../style/icons';

/**
 * This function adds an additional button to the fileBrowser
 * browser toolbar for creating a new simulation setup.
 * @param app - JupyterLab frontend
 * @param model - mosaik-docker extension model
 * @param fileBrowser - JupyterLab file browser
 */
export function addSimSetupCreateButton(
  app: JupyterFrontEnd,
  model: IMosaikDockerExtension,
  fileBrowser: FileBrowser
): void {
  // Instantiate new button.
  const simSetupCreateButton = new SimSetupCreateButton({ app, model });

  // Add button to file browser toolbar.
  fileBrowser.toolbar.addItem('simSetupCreateButton', simSetupCreateButton);
}

export namespace SimSetupCreateButton {
  /** Initialization options for SimSetupCreateButton class. */
  export interface IOptions {
    /** JupyterLab frontend. */
    app: JupyterFrontEnd;

    /** mosaik-docker extension model. */
    model: IMosaikDockerExtension;
  }
}

/**
 * This class implements a button for creating a new simulation
 * setup. This button is intended to be added to the file browser
 * toolbar.
 */
export class SimSetupCreateButton extends ToolbarButton {
  /**
   * Returns an instance of the SimSetupCreateButton class.
   * @param options - initialization options
   * @returns toolbar button instance
   */
  constructor(options: SimSetupCreateButton.IOptions) {
    super({
      icon: buttonSimSetupCreateIcon,
      onClick: () => {
        // Only enable this functions if the current working
        // directory IS NOT (a subfolder of) a simulation setup.
        if (!options.model.isValidSimSetup) {
          // Execute command for creating a new simulation setup.
          options.app.commands.execute(CommandIDs.createSimSetup);
        } else {
          // Show a dialog to notify the user that this action
          // is currently not available.
          showDialog({
            title: 'Create simulation setup',
            body: `Cannot create a new simulation setup as subfolder of an existing setup:\n${
              options.model.simSetupRoot
            }`,
            buttons: [Dialog.cancelButton({ label: 'OK' })]
          });
        }
      },
      tooltip: 'Create Simulation Setup'
    });
  }
}
