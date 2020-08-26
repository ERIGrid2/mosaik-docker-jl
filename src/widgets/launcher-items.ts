import { JupyterFrontEnd } from '@jupyterlab/application';

import { ILauncher } from '@jupyterlab/launcher';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import {
  mosaikDockerLauncherIcon,
  mosaikDockerCliIcon,
  mosaikDockerJlIcon,
  mosaikDockerPyIcon
} from '../style/icons';

export function addLauncherItems(
  app: JupyterFrontEnd,
  launcher: ILauncher,
  settings: ISettingRegistry.ISettings
): void {
  const launcherCommands: Array<string> = [];

  const openMosaikDockerDocs = 'mosaik-docker-jl:open-mosaik-docker-docs';
  app.commands.addCommand(openMosaikDockerDocs, {
    label: 'Documentation',
    caption: 'Open mosaik-docker documentation',
    icon: mosaikDockerLauncherIcon,
    execute: () => {
      window.open(settings.composite['mosaikDockerDocsUrl'] as string);
    }
  });
  launcherCommands.push(openMosaikDockerDocs);

  const openMosaikDockerJLDocs = 'mosaik-docker-jl:open-mosaik-docker-jl-docs';
  app.commands.addCommand(openMosaikDockerJLDocs, {
    label: 'JupyterLab Reference',
    caption: 'Reference for using mosaik-docker with the JupyterLab GUI',
    icon: mosaikDockerJlIcon,
    execute: () => {
      window.open(settings.composite['mosaikDockerJLDocsUrl'] as string);
    }
  });
  launcherCommands.push(openMosaikDockerJLDocs);

  const openMosaikDockerCliDocs =
    'mosaik-docker-jl:open-mosaik-docker-cli-docs';
  app.commands.addCommand(openMosaikDockerCliDocs, {
    label: 'Command Line Reference',
    caption: 'Reference for using mosaik-docker from the command line',
    icon: mosaikDockerCliIcon,
    execute: () => {
      window.open(settings.composite['mosaikDockerCliDocsUrl'] as string);
    }
  });
  launcherCommands.push(openMosaikDockerCliDocs);

  const openMosaikDockerPyDocs = 'mosaik-docker-jl:open-mosaik-docker-py-docs';
  app.commands.addCommand(openMosaikDockerPyDocs, {
    label: 'Python Reference',
    caption: 'Reference for using mosaik-docker with Python scripts',
    icon: mosaikDockerPyIcon,
    execute: () => {
      window.open(settings.composite['mosaikDockerPyDocsUrl'] as string);
    }
  });
  launcherCommands.push(openMosaikDockerPyDocs);

  const category = 'mosaik-docker';
  launcherCommands.forEach(command => {
    launcher.add({
      command,
      category: category,
      rank: launcherCommands.indexOf(command)
    });
  });
}
