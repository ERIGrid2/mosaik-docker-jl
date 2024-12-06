import * as React from 'react';

import { ReactWidget } from '@jupyterlab/apputils';

import { Widget } from '@lumino/widgets';

import { IMosaikDockerExtension, MosaikDocker } from '../tokens';

import { simStatusIcon } from '../style/icons';

/**
 * This namespace provides the definition of the initialization options
 * for the SimStatusWidget class and the SimStatusComponent class.
 */
export namespace SimStatusWidget {
  /** Initialization options for the SimStatusWidget widget. */
  export interface IOptions extends Widget.IOptions {
    /** mosaik-docker extension model. */
    model: IMosaikDockerExtension;
  }

  /** Initialization options for SimStatusComponent class. */
  export interface IComponentProperties {
    /** mosaik-docker extension model. */
    model: IMosaikDockerExtension;
  }
}

/**
 * This class implements a main area widget (React widget)
 * for displaying the status of all simulation of the
 * active simulation setup.
 */
export class SimStatusWidget extends ReactWidget {
  /**
   * Create an instance of the widget.
   * @param options - widget initialization options
   * @returns widget instance
   */
  constructor(options: SimStatusWidget.IOptions) {
    super();

    // Set the CSS id.
    this.node.id = 'mosaik-docker-sim-status';

    // Set the title label.
    this.title.label = 'Simulation Status';

    // Set the title icon.
    this.title.icon = simStatusIcon;

    // Make widget closable.
    this.title.closable = true;

    // Store reference to mosaik-docker extension model.
    this._model = options.model;
  }

  /**
   * Render the React element.
   * @returns React element
   */
  render(): React.ReactElement {
    return <SimStatusComponent model={this._model} />;
  }

  /**
   * Update the status information to be displayed by the widget.
   * @param status - status of all simulations of the currently active simulation setup
   */
  async updateStatus(status: MosaikDocker.ISimStatus): Promise<void> {
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

  /** mosaik-docker extension model. */
  private _model: IMosaikDockerExtension;
}

/**
 * This class implements the React component for class SimStatusWidget.
 */
export class SimStatusComponent extends React.Component<
  SimStatusWidget.IComponentProperties
> {
  /**
   * Create an instance of the widget's React component.
   * @param props - React component properties
   * @returns React component instance
   */
  constructor(props: SimStatusWidget.IComponentProperties) {
    super(props);
  }

  /** Render the "template" for the status information widget as React component.
   * This template comprises a button for refreshing the widget and an empty
   * element (div) intended for displaying the simulation status (to be updated
   * by calling SimStatusWidget's updateStatus method).
   * @returns React element
   */
  render(): React.ReactElement {
    // Define the HTML structure of the widget (content area and update button).
    // The content area for displaying the simulation status is initialized with
    // a spinner. Its content will be updated later on.
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
