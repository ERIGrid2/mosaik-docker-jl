import {
  Widget
} from '@lumino/widgets';


export interface SimSelectReturnValue {
  selectAll: boolean,
  selectItem?: string
}


export interface SimSelectOptions {

  textSelectAll: string;

  textSelectItem: string;

  /**
   * List of choices
   */
  items: Array<string>;
}


export class SimSelectForm extends Widget {


  constructor( options: SimSelectOptions ) {
    super( { node: SimSelectForm.createFormNode( options ) } );
    this.id = 'mosaik-docker-sim-select-form';
  }


  private static createFormNode( options: SimSelectOptions ): HTMLElement {

    // Create HTML elements.
    const node = document.createElement( 'div' );
    const label = document.createElement( 'label' );
    const divSelectAll = document.createElement( 'div' );
    const inputSelectAll = document.createElement( 'input' );
    const textSelectAll = document.createElement( 'span' );
    const inputSelectItem = document.createElement( 'select' );
    const textSelectItem = document.createElement( 'span' );

    // Add section with ID selection.
    textSelectItem.textContent = options.textSelectItem;
    options.items.forEach( ( item, index ) => {
      const option = document.createElement( 'option' );
      if ( index === 0 ) {
        option.selected = true;
      }
      option.value = item;
      option.textContent = item;
      inputSelectItem.appendChild( option );
    } );

    // Add checkbox to select all.
    textSelectAll.textContent = options.textSelectAll;
    inputSelectAll.classList.add( 'jp-mod-styled' );
    inputSelectAll.type = 'checkbox';
    inputSelectAll.checked = false;

    // Adjust style.
    node.className = 'jp-Input-Dialog';
    //divSelectAll.id = 'mosaik-docker-sim-select-form';
    divSelectAll.className = 'jp-SimSelectForm-div';
    textSelectAll.id = 'mosaik-docker-sim-select-form';
    textSelectAll.className = 'jp-SimSelectForm-text';

    // Define structure.
    label.appendChild( textSelectItem );
    label.appendChild( inputSelectItem );
    label.appendChild( divSelectAll );
    divSelectAll.appendChild( inputSelectAll );
    divSelectAll.appendChild( textSelectAll );

    node.appendChild( label );
    return node;
  }


  /**
  * Returns the input value.
  */
  getValue(): SimSelectReturnValue {

    const inputNodesList = this.node.querySelectorAll( 'input' );
    const selectAll = inputNodesList[0].checked;

    if ( true === selectAll ) {
      return {
        selectAll: true
      };
    } else {
      const selectNodesList = this.node.querySelectorAll( 'select' );
      const selectItem = selectNodesList[0].value;

      return {
        selectAll: false,
        selectItem: selectItem
      };
    }
  }

}