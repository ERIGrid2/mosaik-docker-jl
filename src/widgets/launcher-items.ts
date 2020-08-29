import { JupyterFrontEnd } from '@jupyterlab/application';

import { ILauncher } from '@jupyterlab/launcher';

import { CommandIDs } from '../command-ids';

/**
 * This function adds a new card specific to the mosaik-docker
 * extension to the launcher menu. This card contains items that
 * link to external documentation.
 * @param app - JupyterLab frontend
 * @param launcher - JupyterLab launcher menu
 */
export function addLauncherItems(
  app: JupyterFrontEnd,
  launcher: ILauncher
): void {
  // Define launcher card category name.
  const category = 'mosaik-docker';

  // The new launcher card items are calling the commands
  // dedicated to opening external documentation.
  CommandIDs.docs.forEach(command => {
    launcher.add({
      command,
      category: category,
      rank: CommandIDs.docs.indexOf(command)
    });
  });
}
