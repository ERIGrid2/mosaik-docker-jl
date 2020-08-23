import { JupyterFrontEnd } from '@jupyterlab/application';

import { Dialog, ToolbarButton, showDialog } from '@jupyterlab/apputils';

import { FileBrowser } from '@jupyterlab/filebrowser';

import { IMosaikExtension } from '../tokens';

import { CommandIDs } from '../command-ids';

import { buttonSimSetupCreateIcon } from '../style/icons';

export function addSimSetupCreateButton(
  app: JupyterFrontEnd,
  model: IMosaikExtension,
  fileBrowser: FileBrowser
): void {
  const simSetupCreateButton = new SimSetupCreateButton({ app, model });

  fileBrowser.toolbar.addItem('simSetupCreateButton', simSetupCreateButton);
}

export namespace SimSetupCreateButton {
  export interface IOptions {
    app: JupyterFrontEnd;
    model: IMosaikExtension;
  }
}

export class SimSetupCreateButton extends ToolbarButton {
  constructor(options: SimSetupCreateButton.IOptions) {
    super({
      icon: buttonSimSetupCreateIcon,
      onClick: () => {
        if (!options.model.isValidSimSetup) {
          options.app.commands.execute(CommandIDs.createSimSetup);
        } else {
          showDialog({
            title: 'Create simulation setup',
            body: `Cannot create a new simulation setup as subfolder of an existing setup:\n${
              options.model.simSetupRoot
            }`,
            buttons: [Dialog.cancelButton({ label: 'OK' })]
          });
        }
      },
      tooltip: 'Create Simulation Environment'
    });
  }
}
