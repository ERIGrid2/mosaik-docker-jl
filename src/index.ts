import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { showErrorMessage } from '@jupyterlab/apputils';

import { IDefaultFileBrowser } from '@jupyterlab/filebrowser';

import { ILauncher } from '@jupyterlab/launcher';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { IMosaikDockerExtension } from './tokens';

import { MosaikDockerExtension } from './model';

import { addCommands } from './commands';

import { addLauncherItems } from './widgets/launcher-items';

import { addSimMenu } from './widgets/sim-menu';

import { addSimSetupCreateButton } from './widgets/sim-setup-create-button';

import { addSimTab } from './widgets/sim-tab';

/**
 * Initialization data for the mosaik-docker-jl extension.
 */
const plugin: JupyterFrontEndPlugin<IMosaikDockerExtension> = {
  id: 'mosaik-docker-jl:plugin',
  requires: [IDefaultFileBrowser, ISettingRegistry],
  optional: [ILauncher, ILayoutRestorer, IMainMenu],
  provides: IMosaikDockerExtension,
  activate: activateExtension,
  autoStart: true
};

/**
 * Export the extension as default.
 */
export default plugin;

/**
 * Function invoked to activate the extension.
 */
async function activateExtension(
  app: JupyterFrontEnd,
  fileBrowser: IDefaultFileBrowser,
  settingRegistry: ISettingRegistry,
  launcher: ILauncher | null,
  restorer: ILayoutRestorer | null,
  mainMenu: IMainMenu | null
): Promise<IMosaikDockerExtension> {
  // Attempt to load the extension settings.
  let settings: ISettingRegistry.ISettings;
  try {
    settings = await settingRegistry.load(plugin.id);
  } catch (error) {
    const err = `Failed to load settings for the mosaik-docker-jl extension.\n${error}`;
    console.error(err);
    return Promise.reject(err);
  }

  // Initialize the model for interacting with the mosaik-docker package.
  const mde = new MosaikDockerExtension({ app, fileBrowser, restorer });

  // Attempt to retrieve the extension's version.
  // Use this to check if the server extension is running.
  try {
    const version = await mde.getVersion();
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
      String(error)
    );
  }

  // Make the extension's functionality available as JupyterLab commands.
  addCommands(app, mde, settings);

  // Add a button for creating sim setups to the file browser tab.
  addSimSetupCreateButton(app, mde, fileBrowser);

  // Make the extension's functionality available via a dedicated side tab.
  addSimTab(app, mde, restorer);

  // Make the extension's functionality available via a dedicated menu tab.
  if (mainMenu) {
    addSimMenu(app, mainMenu);
  }

  // Add links to documentation to the laucher menu.
  if (launcher) {
    addLauncherItems(app, launcher);
  }

  return Promise.resolve(mde);
}
