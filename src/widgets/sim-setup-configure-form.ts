import { Widget } from '@lumino/widgets';

import { MosaikDockerSim } from '../tokens';

export interface ISimSetupConfigureReturnValue {
  scenarioFile: string;
  dockerFile: string;
  extraFiles: Array<string>;
  extraDirs: Array<string>;
  results: Array<string>;
}

export class SimSetupConfigureForm extends Widget {
  /**
   * Create a redirect form.
   */
  constructor(placeholder: MosaikDockerSim.IConfigData) {
    const { orchestrator } = placeholder;

    SimSetupConfigureForm._placeholderDockerFile = orchestrator.docker_file;
    SimSetupConfigureForm._placeholderScenarioFile = orchestrator.scenario_file;
    SimSetupConfigureForm._placeholderExtraFiles = orchestrator.extra_files.join(
      ', '
    );
    SimSetupConfigureForm._placeholderExtraDirs = orchestrator.extra_dirs.join(
      ', '
    );
    SimSetupConfigureForm._placeholderResults = orchestrator.results.join(', ');

    super({ node: SimSetupConfigureForm.createFormNode(placeholder) });
  }

  private static createFormNode(
    placeholder: MosaikDockerSim.IConfigData
  ): HTMLElement {
    const node = document.createElement('div');
    const label = document.createElement('label');
    const inputDockerFile = document.createElement('input');
    const textDockerFile = document.createElement('span');
    const inputScenarioFile = document.createElement('input');
    const textScenarioFile = document.createElement('span');
    const inputExtraFiles = document.createElement('input');
    const textExtraFiles = document.createElement('span');
    const inputExtraDirs = document.createElement('input');
    const textExtraDirs = document.createElement('span');
    const inputResults = document.createElement('input');
    const textResults = document.createElement('span');

    node.className = 'jp-RedirectForm';

    textDockerFile.textContent =
      'Path to the Dockerfile for the simulation orchestrator image:';
    inputDockerFile.value = SimSetupConfigureForm._placeholderDockerFile;

    textScenarioFile.textContent = 'Name of the mosaik scenario file:';
    inputScenarioFile.value = SimSetupConfigureForm._placeholderScenarioFile;

    textExtraFiles.textContent =
      'Additional files to be added to the simulation orchestrator image (comma-separated list):';
    inputExtraFiles.value = SimSetupConfigureForm._placeholderExtraFiles;

    textExtraDirs.textContent =
      'Additional folders to be added to the simulation orchestrator image (comma-separated list):';
    inputExtraDirs.value = SimSetupConfigureForm._placeholderExtraDirs;

    textResults.textContent =
      'Results files or folders produced by the simulation that should be retrieved after the simulation has finished (comma-separated list):';
    inputResults.value = SimSetupConfigureForm._placeholderResults;

    label.appendChild(textDockerFile);
    label.appendChild(inputDockerFile);
    label.appendChild(textScenarioFile);
    label.appendChild(inputScenarioFile);
    label.appendChild(textExtraFiles);
    label.appendChild(inputExtraFiles);
    label.appendChild(textExtraDirs);
    label.appendChild(inputExtraDirs);
    label.appendChild(textResults);
    label.appendChild(inputResults);
    node.appendChild(label);
    return node;
  }

  /**
   * Returns the input value.
   */
  getValue(): ISimSetupConfigureReturnValue {
    const inputNodesList = this.node.querySelectorAll('input');

    const dockerFile =
      inputNodesList[0].value === ''
        ? SimSetupConfigureForm._placeholderDockerFile
        : inputNodesList[0].value;
    const scenarioFile =
      inputNodesList[1].value === ''
        ? SimSetupConfigureForm._placeholderScenarioFile
        : inputNodesList[1].value;
    const extraFiles =
      inputNodesList[2].value === ''
        ? SimSetupConfigureForm._placeholderExtraFiles
        : inputNodesList[2].value;
    const extraDirs =
      inputNodesList[3].value === ''
        ? SimSetupConfigureForm._placeholderExtraDirs
        : inputNodesList[3].value;
    const results =
      inputNodesList[4].value === ''
        ? SimSetupConfigureForm._placeholderResults
        : inputNodesList[4].value;

    return {
      scenarioFile: scenarioFile,
      dockerFile: dockerFile,
      extraFiles: extraFiles.split(','),
      extraDirs: extraDirs.split(','),
      results: results.split(',')
    };
  }

  private static _placeholderDockerFile: string;
  private static _placeholderScenarioFile: string;
  private static _placeholderExtraFiles: string;
  private static _placeholderExtraDirs: string;
  private static _placeholderResults: string;
}
