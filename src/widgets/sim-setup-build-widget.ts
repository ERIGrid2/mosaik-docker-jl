import { MainAreaWidget } from '@jupyterlab/apputils';

import { Widget } from '@lumino/widgets';

import { JSONObject } from '@lumino/coreutils';

import { simSetupBuildIcon } from '../style/icons';

export namespace SimSetupBuildWidget {
  export interface IOptions {
    simSetupDir: string;
  }
}

export class SimSetupBuildWidget extends MainAreaWidget {
  constructor(options: SimSetupBuildWidget.IOptions) {
    super({ content: new Widget() });

    this.id = 'mosaik-docker-sim-build';
    this.title.icon = simSetupBuildIcon;
    this.title.label = 'Docker Build Status: ' + options.simSetupDir;
    this.title.closable = true;

    this.content.addClass('jp-Widget');
    this.content.addClass('jp-Spinner');

    const statusHeader = document.createElement('span');
    statusHeader.className = 'jp-Widget-header';
    statusHeader.innerText = `Simulation setup location: ${
      options.simSetupDir
    }`;
    this.content.node.appendChild(statusHeader);

    this._statusContent = document.createElement('span');
    this._statusContent.className = 'jp-Widget-content';
    this.content.node.appendChild(this._statusContent);

    this._statusContentSpinner = document.createElement('div');
    this._statusContentSpinner.className = 'jp-SpinnerContent';
    this.content.node.appendChild(this._statusContentSpinner);
  }

  async updateStatus(statusUpdate: JSONObject): Promise<void> {
    this._statusContent.innerText += statusUpdate['out'] + '\n';
  }

  async done(statusDone?: JSONObject): Promise<void> {
    if (statusDone !== undefined) {
      //console.log( 'statusDone:', statusDone );
      this._statusContent.innerText += '\n' + statusDone['done'];
    }
    this.content.node.removeChild(this._statusContentSpinner);
  }

  private _statusContentSpinner: HTMLElement;
  private _statusContent: HTMLElement;
}
