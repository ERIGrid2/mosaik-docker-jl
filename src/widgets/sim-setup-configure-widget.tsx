import * as React from 'react';

import { ReactWidget, showErrorMessage } from '@jupyterlab/apputils';

import { Widget } from '@lumino/widgets';

import { IMosaikDockerExtension, MosaikDocker } from '../tokens';

import { simSetupConfigIcon } from '../style/icons';

export namespace SimSetupConfigureWidget {
  /** Initialization options for SimSetupConfigureWidget class. */
  export interface IOptions extends Widget.IOptions {
    /** mosaik-docker extension model. */
    model: IMosaikDockerExtension;

    /** Simulation setup configuration data. */
    configData: MosaikDocker.IConfigData;
  }

  /** Initialization options for SimSetupConfigureComponent class. */
  export interface IComponentProperties {
    /** mosaik-docker extension model. */
    model: IMosaikDockerExtension;

    /** Instance of simulation setup configuration widget. */
    widget: SimSetupConfigureWidget;

    /** Simulation setup configuration data. */
    configData: MosaikDocker.IConfigData;
  }
}

/**
 * This class implements a main area widget (React widget)
 * for configuring a simulation setup.
 */
export class SimSetupConfigureWidget extends ReactWidget {
  /**
   * Create an instance of the widget.
   * @param options - widget initialization options
   * @returns widget instance
   */
  constructor(options: SimSetupConfigureWidget.IOptions) {
    super();

    // Define CSS id.
    this.id = 'mosaik-docker-sim-setup-config';

    // Set widget title icon.
    this.title.icon = simSetupConfigIcon;

    // Set widget title label.
    this.title.label = 'Sim Setup Configuration';

    // Make widget closable.
    this.title.closable = true;

    this._model = options.model;
    this._configData = options.configData;
  }

  /**
   * Render the widget.
   * @returns React widget
   */
  render(): React.ReactElement {
    return (
      <SimSetupConfigureComponent
        model={this._model}
        widget={this}
        configData={this._configData}
      />
    );
  }

  /**
   * Retrieve the configuration data specified by the user.
   * @returns simulation setup configuration
   */
  getConfigData(): MosaikDocker.IOrchestratorConfigData {
    // Retrieve HTML input fields.
    const inputNodesList = this.node.querySelectorAll('input');

    return {
      scenarioFile: inputNodesList[0].value,
      dockerFile: inputNodesList[1].value,
      extraFiles: inputNodesList[2].value.split(','),
      extraDirs: inputNodesList[3].value.split(','),
      results: inputNodesList[4].value.split(',')
    };
  }

  /** mosaik-docker extension model. */
  private _model: IMosaikDockerExtension;

  /** Initial simulation setup configuration data. */
  private _configData: MosaikDocker.IConfigData;
}

/**
 * This class implements the React component for class SimSetupConfigureWidget.
 */
export class SimSetupConfigureComponent extends React.Component<
  SimSetupConfigureWidget.IComponentProperties
> {
  /**
   * Create an instance of the widget's React component.
   * @param props - React component properties
   * @returns React component instance
   */
  constructor(props: SimSetupConfigureWidget.IComponentProperties) {
    super(props);
    this._simSetupDir = this.props.model.simSetupRoot;
  }

  /**
   * Render the React element.
   * @returns React element
   */
  render(): React.ReactElement {
    // Retrieve the initial configuration data.
    const { orchestrator } = this.props.configData;
    const scenarioFile = orchestrator.scenarioFile;
    const dockerFile = orchestrator.dockerFile;
    const extraFiles = orchestrator.extraFiles.join(', ');
    const extraDirs = orchestrator.extraDirs.join(', ');
    const results = orchestrator.results.join(', ');

    // Define the HTML structure of the widget (header, input fields and update button).
    return (
      <div className="jp-Widget">
        <div className="jp-Content">
          <span className="jp-Content-header">
            Simulation setup location: {this._simSetupDir}
          </span>
          <span className="jp-Content-input-header">
            Name of the mosaik scenario file:
          </span>
          <input defaultValue={scenarioFile} className="jp-Content-input" />
          <span className="jp-Content-input-header">
            Path to the Dockerfile for the simulation orchestrator image:
          </span>
          <input defaultValue={dockerFile} className="jp-Content-input" />
          <span className="jp-Content-input-header">
            Additional files to be added to the simulation orchestrator image
            (comma-separated list):
          </span>
          <input defaultValue={extraFiles} className="jp-Content-input" />
          <span className="jp-Content-input-header">
            Additional folders to be added to the simulation orchestrator image
            (comma-separated list):
          </span>
          <input defaultValue={extraDirs} className="jp-Content-input" />
          <span className="jp-Content-input-header">
            Results files or folders produced by the simulation that should be
            retrieved after the simulation has finished (comma-separated list):
          </span>
          <input defaultValue={results} className="jp-Content-input" />
        </div>
        <div className="jp-Dialog-span">
          <button
            className="jp-mod-reject jp-mod-styled"
            onClick={async () => {
              const data = this.props.widget.getConfigData();
              try {
                await this.props.model.configureSimSetup(
                  data,
                  this._simSetupDir
                );
              } catch (error) {
                console.error(error);
                showErrorMessage(
                  'An error occurred while attempting to display the simulation status!\n',
                  String(error)
                );
              }
            }}
          >
            UPDATE CONFIGURATION
          </button>
        </div>
      </div>
    );
  }

  /** Path to the simulation setup root directory. */
  private _simSetupDir: string;
}
