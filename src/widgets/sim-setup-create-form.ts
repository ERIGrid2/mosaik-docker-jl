import {
  Widget
} from '@lumino/widgets';


export class SimSetupCreateForm extends Widget {
  /**
  * Create a redirect form.
  */
  constructor() {
    super( { node: SimSetupCreateForm.createFormNode() } );
  }

  private static createFormNode(): HTMLElement {
    const node = document.createElement( 'div' );
    const label = document.createElement( 'label' );
    const input = document.createElement( 'input' );
    const text = document.createElement( 'span' );

    node.className = 'jp-RedirectForm';
    text.textContent = 'Enter the name of the new mosaik-docker simulation setup:';
    input.placeholder = SimSetupCreateForm._defaultSetupName;

    label.appendChild( text );
    label.appendChild( input );
    node.appendChild( label );
    return node;
  }

  /**
  * Returns the input value.
  */
  getValue(): string {
    const value = this.node.querySelector( 'input' ).value;
    return ( value === '' ) ? SimSetupCreateForm._defaultSetupName : value;
  }
  

  /// Default value for sim setup (also used as placeholder in the widget).
  private static _defaultSetupName: string = 'mosaik-docker-sim';
}
