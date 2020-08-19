import {
  Widget
} from '@lumino/widgets';


export interface SimSetupConfigureReturnValue {
  scenarioFile: string,
  dockerFile: string,
  extraFiles: Array<string>,
  extraDirs: Array<string>,
  results: Array<string>
}

  
export class SimSetupConfigureForm extends Widget {
  /**
  * Create a redirect form.
  */
  constructor() {
    super( { node: SimSetupConfigureForm.createFormNode() } );
  }


  private static createFormNode(): HTMLElement {
    const node = document.createElement( 'div' );
    const label = document.createElement( 'label' );
    const inputDockerFile = document.createElement( 'input' );
    const textDockerFile = document.createElement( 'span' );
    const inputScenarioFile = document.createElement( 'input' );
    const textScenarioFile = document.createElement( 'span' );
    const inputExtraFiles = document.createElement( 'input' );
    const textExtraFiles = document.createElement( 'span' );
    const inputExtraDirs = document.createElement( 'input' );
    const textExtraDirs = document.createElement( 'span' );
    const inputResults = document.createElement( 'input' );
    const textResults = document.createElement( 'span' );

    node.className = 'jp-RedirectForm';

    textDockerFile.textContent = 'Path to the Dockerfile for the simulation orchestrator image:';
    inputDockerFile.placeholder = SimSetupConfigureForm._defaultDockerFile;

    textScenarioFile.textContent = 'Name of the mosaik scenario file:';
    inputScenarioFile.placeholder = SimSetupConfigureForm._defaultScenarioFile;

    textExtraFiles.textContent = 'Additional files to be added to the simulation orchestrator image (comma-separated list):';
    inputExtraFiles.placeholder = '';

    textExtraDirs.textContent = 'Additional folders to be added to the simulation orchestrator image (comma-separated list):';
    inputExtraDirs.placeholder = '';

    textResults.textContent = 'Results files or folders produced by the simulation that should be retrieved after the simulation has finished (comma-separated list):';
    inputResults.placeholder = '';

    label.appendChild( textDockerFile );
    label.appendChild( inputDockerFile );
    label.appendChild( textScenarioFile );
    label.appendChild( inputScenarioFile );
    label.appendChild( textExtraFiles );
    label.appendChild( inputExtraFiles );
    label.appendChild( textExtraDirs );
    label.appendChild( inputExtraDirs );
    label.appendChild( textResults );
    label.appendChild( inputResults );
    node.appendChild( label );
    return node;
  }


  /**
  * Returns the input value.
  */
  getValue(): SimSetupConfigureReturnValue {

    const inputNodesList = this.node.querySelectorAll( 'input' );

    const dockerFile = ( inputNodesList[0].value === '' ) ?
      SimSetupConfigureForm._defaultDockerFile : inputNodesList[0].value;
    const scenarioFile = ( inputNodesList[1].value === '' ) ?
      SimSetupConfigureForm._defaultScenarioFile : inputNodesList[1].value;
    const extraFiles = inputNodesList[2].value;
    const extraDirs = inputNodesList[3].value;
    const results = inputNodesList[4].value;

    return {
      scenarioFile: scenarioFile,
      dockerFile: dockerFile,
      extraFiles: extraFiles.split(','),
      extraDirs: extraDirs.split(','),
      results: results.split(',')
    };
  }


  private static _defaultDockerFile: string = 'dockerfiles/Dockerfile_main';

  private static _defaultScenarioFile: string = 'main.py';
}