import {
  MainAreaWidget
} from '@jupyterlab/apputils';

import {
  Widget
} from '@lumino/widgets';

import {
  IMosaikExtension,
  MosaikDockerSim
} from '../tokens'

import {
  simStatusIcon
} from '../style/icons';



export class SimStatusWidget extends MainAreaWidget {

  constructor( mosaikExtension: IMosaikExtension ) {
    super( { content: new Widget() } );

    this.content.addClass( 'jp-Widget' );

    this.id = 'mosaik-docker-sim-status';
    this.title.label = 'Simulation Status';
    this.title.icon = simStatusIcon;
    this.title.closable = true;

    mosaikExtension.stateChanged.connect( this._update, this );
  }


  async updateStatus( status : MosaikDockerSim.SimStatus ) : Promise<void> {

    this._clear();

    const simSetupDir = await status.dir;
    const simStatus = await status.status;
    const simsUp = await simStatus.up;
    const simsDown = await simStatus.down;

    let statusHeader = document.createElement( 'span' );
    statusHeader.className = 'jp-Widget-header';
    statusHeader.innerText = `Simulation setup location: ${simSetupDir}`;

    let simsUpHeader = document.createElement( 'span' );
    simsUpHeader.className = 'jp-Widget-list-header';
    simsUpHeader.innerText = 'Running Simulations';

    let simsUpList = document.createElement( 'ul' );
    simsUpList.className = 'jp-Widget-list';

    for ( const [ id, info ] of Object.entries( simsUp ) ) {
      let simUpElem = document.createElement( 'li' );
      simUpElem.innerText = `${id}: ${info}`;
      simsUpList.appendChild( simUpElem );
    }

    let simsDownHeader = document.createElement( 'span' );
    simsDownHeader.className = 'jp-Widget-list-header';
    simsDownHeader.innerText = 'Finished Simulations';

    let simsDownList = document.createElement( 'ul' );
    simsDownList.className = 'jp-Widget-list';

    for ( const [ id, info ] of Object.entries( simsDown ) ) {
      let simsDownElem = document.createElement( 'li' );
      simsDownElem.innerText = `${id}: ${info}`;
      simsDownList.appendChild( simsDownElem );
    }

    this.content.node.appendChild( statusHeader );
    this.content.node.appendChild( simsUpHeader );
    this.content.node.appendChild( simsUpList );
    this.content.node.appendChild( simsDownHeader );
    this.content.node.appendChild( simsDownList );
  }


  private async _update(
    emitter: IMosaikExtension
  ): Promise<void> {
    if ( this.isAttached ) {
      try {
        await emitter.displaySimStatus();
      } catch ( error ) {
        console.error( error );
      }
    }
  }


  private _clear() : void {
    while( this.content.node.firstChild ){
      this.content.node.removeChild( this.content.node.firstChild );
    }
  }
}