import { JupyterFrontEnd } from '@jupyterlab/application';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { Menu } from '@lumino/widgets';

import { CommandIDs } from '../command-ids';

/**
 * Add new menu for mosaik-docker commands
 * @param app - JupyterLab frontend
 * @param mainMenu - JupyterLab main menu
 */
export function addSimMenu(app: JupyterFrontEnd, mainMenu: IMainMenu): void {
  // Create new menu.
  const { commands } = app;
  const menu = new Menu({ commands });

  // Set menu title.
  menu.title.label = 'Mosaik';

  // Add commands to menu.
  CommandIDs.all.forEach(command => {
    menu.addItem({ command });
  });

  // Add documentation links to menu.
  //menu.addItem({ type: 'separator' })
  //CommandIDs.docs.forEach(command => {
  //  menu.addItem({ command });
  //});

  // Add the mosaik-docker extension menu to the main menu.
  mainMenu.addMenu(menu, true, { rank: 60 });
}
