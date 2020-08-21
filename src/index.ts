import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  //WidgetTracker,
  showErrorMessage
} from '@jupyterlab/apputils';

import { IFileBrowserFactory } from '@jupyterlab/filebrowser';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { IMosaikExtension } from './tokens';

import { MosaikExtension } from './model';

import { addCommands } from './commands';

import { addSimMenu } from './widgets/sim-menu';

import { addSimSetupCreateButton } from './widgets/sim-setup-create-button';

// import {
// SimStatusWidget
// } from './widgets/sim-status-widget';

import { addSimTab } from './widgets/sim-tab';

/**
 * Initialization data for the mosaik-docker-jl extension.
 */
const extension: JupyterFrontEndPlugin<IMosaikExtension> = {
  id: 'mosaik-docker-jl',
  requires: [IFileBrowserFactory, ILayoutRestorer, IMainMenu],
  provides: IMosaikExtension,
  activate: activateExtension,
  autoStart: true
};

export default extension;

async function activateExtension(
  app: JupyterFrontEnd,
  fileBrowserFactory: IFileBrowserFactory,
  restorer: ILayoutRestorer,
  mainMenu: IMainMenu
): Promise<IMosaikExtension> {
  // Get a reference to the default file browser extension
  const fileBrowser = fileBrowserFactory.defaultBrowser;

  const mosaikExtension = new MosaikExtension(app, fileBrowser, restorer);

  try {
    const version = await mosaikExtension.getVersion();
    console.log(
      `[mosaik-docker-jl] JupyterLab extension activated, version = ${
        version.version
      }`
    );

    //await mosaikExtension.retrieveUserHomeDir();
    //console.log(
    //  `[mosaik-docker-jl] user home directory = ${ mosaikExtension.userHomeDir }`
    //);
  } catch (error) {
    console.error(
      `[mosaik-docker-jl] the mosaik_docker_jl server extension appears to be missing.\n${error}`
    );
    showErrorMessage(
      'The mosaik_docker_jl server extension appears to be missing!',
      error
    );
  }

  addCommands(app, mosaikExtension);

  addSimMenu(app, mainMenu);

  addSimSetupCreateButton(app, mosaikExtension, fileBrowser);

  addSimTab(app, mosaikExtension, restorer);

  return Promise.resolve(mosaikExtension);
}
