import * as React from 'react';

import { ReactWidget, showErrorMessage } from '@jupyterlab/apputils';

import { Widget } from '@lumino/widgets';

import { IMosaikExtension, MosaikDockerSim } from '../tokens';

import { simSetupConfigIcon } from '../style/icons';

export namespace SimSetupConfigureWidget {
  export interface IOptions extends Widget.IOptions {
    model: IMosaikExtension;
    configData: MosaikDockerSim.IConfigData;
  }

  export interface IComponentProperties {
    model: IMosaikExtension;
    widget: SimSetupConfigureWidget;
    configData: MosaikDockerSim.IConfigData;
  }
}

export class SimSetupConfigureWidget extends ReactWidget {
  /**
   * Create a redirect form.
   */
  constructor(options: SimSetupConfigureWidget.IOptions) {
    super(options);

    this.id = 'mosaik-docker-sim-setup-config';
    this.title.icon = simSetupConfigIcon;
    this.title.label = 'Sim Setup Configuration';
    this.title.closable = true;

    this._model = options.model;
    this._configData = options.configData;
  }

  /// Render the widget.
  render(): React.ReactElement {
    return (
      <SimSetupConfigureComponent
        model={this._model}
        widget={this}
        configData={this._configData}
      />
    );
  }

  getConfigData(): MosaikDockerSim.IOrchestratorConfigData {
    const inputNodesList = this.node.querySelectorAll('input');

    return {
      scenarioFile: inputNodesList[0].value,
      dockerFile: inputNodesList[1].value,
      extraFiles: inputNodesList[2].value.split(','),
      extraDirs: inputNodesList[3].value.split(','),
      results: inputNodesList[4].value.split(',')
    };
  }

  private _model: IMosaikExtension;
  private _configData: MosaikDockerSim.IConfigData;
}

export class SimSetupConfigureComponent extends React.Component<
  SimSetupConfigureWidget.IComponentProperties
> {
  /// Constructor.
  constructor(props: SimSetupConfigureWidget.IComponentProperties) {
    super(props);
    this._simSetupDir = this.props.model.simSetupRoot;
  }

  render(): React.ReactElement {
    const { orchestrator } = this.props.configData;
    const scenarioFile = orchestrator.scenarioFile;
    const dockerFile = orchestrator.dockerFile;
    const extraFiles = orchestrator.extraFiles.join(', ');
    const extraDirs = orchestrator.extraDirs.join(', ');
    const results = orchestrator.results.join(', ');

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
                  error
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

  private _simSetupDir: string;
}
