import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { showErrorMessage } from '@jupyterlab/apputils';

import { IFileBrowserFactory } from '@jupyterlab/filebrowser';

import { ILauncher } from '@jupyterlab/launcher';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { IMosaikExtension } from './tokens';

import { MosaikExtension } from './model';

import { addCommands } from './commands';

import { addLauncherItems } from './widgets/launcher-items';

import { addSimMenu } from './widgets/sim-menu';

import { addSimSetupCreateButton } from './widgets/sim-setup-create-button';

import { addSimTab } from './widgets/sim-tab';

/**
 * Initialization data for the mosaik-docker-jl extension.
 */
const extension: JupyterFrontEndPlugin<IMosaikExtension> = {
  id: 'mosaik-docker-jl',
  requires: [IFileBrowserFactory],
  optional: [ILauncher, ILayoutRestorer, IMainMenu],
  provides: IMosaikExtension,
  activate: activateExtension,
  autoStart: true
};

export default extension;

async function activateExtension(
  app: JupyterFrontEnd,
  fileBrowserFactory: IFileBrowserFactory,
  launcher: ILauncher | null,
  restorer: ILayoutRestorer | null,
  mainMenu: IMainMenu | null
): Promise<IMosaikExtension> {
  // Get a reference to the default file browser extension
  const fileBrowser = fileBrowserFactory.defaultBrowser;

  const mosaikExtension = new MosaikExtension({ app, fileBrowser, restorer });

  try {
    const version = await mosaikExtension.getVersion();
    console.log(
      `[mosaik-docker-jl] JupyterLab extension activated, version = ${
        version.version
      }`
    );
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

  addSimSetupCreateButton(app, mosaikExtension, fileBrowser);

  addSimTab(app, mosaikExtension, restorer);

  if (mainMenu) {
    addSimMenu(app, mainMenu);
  }

  if (launcher) {
    addLauncherItems(app, launcher);
  }

  return Promise.resolve(mosaikExtension);
}
