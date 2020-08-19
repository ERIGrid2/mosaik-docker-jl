import {
  JupyterFrontEnd
} from '@jupyterlab/application';

import {
  IMainMenu
} from '@jupyterlab/mainmenu';

import { 
  Menu 
} from '@lumino/widgets';

import {
  CommandIDs
} from '../command-ids';


/**
 * Add commands and menu items
 */
export function addSimMenu(
  app: JupyterFrontEnd,
  mainMenu: IMainMenu
): void {

  const { commands } = app;
  const menu = new Menu( { commands } );
  menu.title.label = 'Mosaik';
  CommandIDs.all.forEach( 
    command => { menu.addItem( { command } ); } 
  );

  // Add a menu for the plugin
  mainMenu.addMenu(
    menu, { rank: 60 }
  );
}
