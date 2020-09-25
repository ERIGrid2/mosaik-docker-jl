import { MainAreaWidget } from '@jupyterlab/apputils';

import { Widget } from '@lumino/widgets';

import { JSONObject } from '@lumino/coreutils';

import { simSetupBuildIcon } from '../style/icons';

export namespace SimSetupBuildWidget {
  /** Initialization options for SimSetupBuildWidget class. */
  export interface IOptions {
    /** Path to simulation setup root directory. */
    simSetupDir: string;
  }
}

/**
 * This class is a main area widget that displays the build process of a simulation setup.
 */
export class SimSetupBuildWidget extends MainAreaWidget {
  /**
   * Returns an instance of the SimSetupBuildWidget class.
   * @param options - widget initialization options
   * @returns widget instance
   */
  constructor(options: SimSetupBuildWidget.IOptions) {
    super({ content: new Widget() });

    // Set widget title icon.
    this.title.icon = simSetupBuildIcon;

    // Define widget title label.
    this.title.label = 'Docker Build Status';

    // Make widget closable.
    this.title.closable = true;

    // Define CSS id and add CSS classes.
    this.id = 'mosaik-docker-sim-build';
    this.content.addClass('jp-Widget');
    this.content.addClass('jp-Spinner');

    // Define and append header element.
    const statusHeader = document.createElement('span');
    statusHeader.className = 'jp-Widget-header';
    statusHeader.innerHTML = `Simulation setup location: ${
      options.simSetupDir
    }`;
    this.content.node.appendChild(statusHeader);

    // Define and append node for displaying the progress of the build process.
    // This node is empty at the beginning and is updated later on.
    this._statusContent = document.createElement('span');
    this._statusContent.className = 'jp-Widget-content';
    this.content.node.appendChild(this._statusContent);

    // Add a spinner to visualize that the build process is still ongoing.
    this._statusContentSpinner = document.createElement('div');
    this._statusContentSpinner.className = 'jp-SpinnerContent';
    this.content.node.appendChild(this._statusContentSpinner);
  }

  /**
   * Call this method to update and display information about the build process.
   * @param statusUpdate - JSON object
   */
  async updateStatus(statusUpdate: JSONObject): Promise<void> {
    this._statusContent.innerHTML += statusUpdate['out'] + '<br>';
  }

  /**
   * Call this method to once the build process has ended.
   * This will display the final status update and remove the spinner.
   * @param statusUpdate - JSON object
   */
  async done(statusDone?: JSONObject): Promise<void> {
    if (statusDone !== undefined) {
      this._statusContent.innerHTML += '<br>' + statusDone['done'];
    }
    this.content.node.removeChild(this._statusContentSpinner);
  }

  /** HTML element containing the spinner. */
  private _statusContentSpinner: HTMLElement;

  /** HTML element displaying the build status. */
  private _statusContent: HTMLElement;
}
