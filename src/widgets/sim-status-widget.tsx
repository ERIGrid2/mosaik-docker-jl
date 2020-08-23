import * as React from 'react';

import { ReactWidget } from '@jupyterlab/apputils';

import { Widget } from '@lumino/widgets';

import { IMosaikExtension, MosaikDockerSim } from '../tokens';

import { simStatusIcon } from '../style/icons';

export namespace SimStatusWidget {
  export interface IOptions extends Widget.IOptions {
    model: IMosaikExtension;
  }
  
  export interface IComponentProperties {
    model: IMosaikExtension;
  }
}

export class SimStatusWidget extends ReactWidget {
  /// Constructor.
  constructor(options: SimStatusWidget.IOptions) {
    super(options);

    this.node.id = 'mosaik-docker-sim-status';
    this.title.label = 'Simulation Status';
    this.title.icon = simStatusIcon;
    this.title.closable = true;

    this._model = options.model;
  }

  /// Render the widget.
  render(): React.ReactElement {
    return <SimStatusComponent model={this._model} />;
  }

  /// Update the status information to be displayed by the widget.
  async updateStatus(status: MosaikDockerSim.ISimStatus): Promise<void> {
    // Retrieve information to be displayed.
    const simSetupDir = await status.dir;
    const simStatus = await status.status;
    const simsUp = await simStatus.up;
    const simsDown = await simStatus.down;

    // Retrieve HTML element (div) for displaying the status information.
    const elements = this.node.getElementsByClassName('jp-Content');
    if (1 !== elements.length) {
      console.error(
        `[mosaik-docker-jl] SimStatusWidget: wrong number of elements with class name 'jp-Widget' (${
          elements.length
        } instead of 1 )`
      );
    }
    const contentDiv = elements[0];

    // Clear old information.
    while (contentDiv.firstChild) {
      contentDiv.removeChild(contentDiv.firstChild);
    }

    // Create header.
    const statusHeader = document.createElement('span');
    statusHeader.className = 'jp-Content-header';
    statusHeader.innerText = `Simulation setup location: ${simSetupDir}`;

    // Create heading for list with running simulations.
    const simsUpHeader = document.createElement('span');
    simsUpHeader.className = 'jp-Content-list-header';
    simsUpHeader.innerText = 'Running Simulations';

    // Create and fill list with running simulations.
    const simsUpList = document.createElement('ul');
    simsUpList.className = 'jp-Content-list';
    for (const [id, info] of Object.entries(simsUp)) {
      const simUpElem = document.createElement('li');
      simUpElem.innerText = `${id}: ${info}`;
      simsUpList.appendChild(simUpElem);
    }

    // Create heading for list with finished simulations.
    const simsDownHeader = document.createElement('span');
    simsDownHeader.className = 'jp-Content-list-header';
    simsDownHeader.innerText = 'Finished Simulations';

    // Create and fill list with finished simulations.
    const simsDownList = document.createElement('ul');
    simsDownList.className = 'jp-Content-list';
    for (const [id, info] of Object.entries(simsDown)) {
      const simsDownElem = document.createElement('li');
      simsDownElem.innerText = `${id}: ${info}`;
      simsDownList.appendChild(simsDownElem);
    }

    // Append all elements.
    contentDiv.appendChild(statusHeader);
    contentDiv.appendChild(simsUpHeader);
    contentDiv.appendChild(simsUpList);
    contentDiv.appendChild(simsDownHeader);
    contentDiv.appendChild(simsDownList);
  }

  private _model: IMosaikExtension;
}

export class SimStatusComponent extends React.Component<
  SimStatusWidget.IComponentProperties
> {
  /// Constructor.
  constructor(props: SimStatusWidget.IComponentProperties) {
    super(props);
  }

  /** Render the "template" for the status information widget as React component.
   * This template comprises a button for refreshing the widget and an empty
   * element (div) intended for displaying the simulation status (to be updated
   * by calling SimStatusWidget's updateStatus method).
   */
  render(): React.ReactElement {
    return (
      <div className="jp-Widget">
        <div className="jp-Content">
          <div className="jp-SpinnerContent" />
        </div>
        <div className="jp-Dialog-span">
          <button
            className="jp-mod-reject jp-mod-styled"
            onClick={() => this.props.model.displaySimStatus()}
          >
            REFRESH
          </button>
        </div>
      </div>
    );
  }
}
