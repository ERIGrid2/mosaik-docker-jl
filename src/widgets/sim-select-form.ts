import { Widget } from '@lumino/widgets';

/**
 * This namespace provides the definition of initialization options
 * and the return type for the SimSelectForm class.
 */
export namespace SimSelectForm {
  /** Initialization options for the SimSelectForm widget. */
  export interface IOptions {
    /** Display text for selecting one item. */
    textSelectItem: string;

    /** Display text for selecting all items. */
    textSelectAll: string;

    /** List of choices. */
    items: Array<string>;
  }

  /** Return type of the SimSelectForm widget. */
  export interface IReturnValue {
    /** Flag for selecting all items. */
    selectAll: boolean;

    /** In case not all items have been selected, specify which one was selected. */
    selectItem?: string;
  }
}

/**
 * This widget displays a dialog that lets users select from a list of items either
 * all items or just one specific item.
 */
export class SimSelectForm extends Widget {
  /**
   * Returns an instance of the SimSelectForm class.
   * @param options - widget initialization options
   * @returns widget instance
   */
  constructor(options: SimSelectForm.IOptions) {
    super({ node: SimSelectForm._createFormNode(options) });
    this.id = 'mosaik-docker-sim-select-form';
  }

  /**
   * Create the HTML element for the widget.
   * @private
   * @param options - widget initialization options
   * @returns HTML element
   */
  private static _createFormNode(options: SimSelectForm.IOptions): HTMLElement {
    // Create HTML elements.
    const node = document.createElement('div');
    const label = document.createElement('label');
    const divSelectAll = document.createElement('div');
    const inputSelectAll = document.createElement('input');
    const textSelectAll = document.createElement('span');
    const inputSelectItem = document.createElement('select');
    const textSelectItem = document.createElement('span');

    // Add section with ID selection.
    textSelectItem.textContent = options.textSelectItem;
    options.items.forEach((item, index) => {
      const option = document.createElement('option');
      if (index === 0) {
        option.selected = true;
      }
      option.value = item;
      option.textContent = item;
      inputSelectItem.appendChild(option);
    });

    // Add checkbox to select all.
    textSelectAll.textContent = options.textSelectAll;
    inputSelectAll.classList.add('jp-mod-styled');
    inputSelectAll.type = 'checkbox';
    inputSelectAll.checked = false;

    // Adjust style.
    node.className = 'jp-Input-Dialog';
    divSelectAll.className = 'jp-SimSelectForm-div';
    textSelectAll.id = 'mosaik-docker-sim-select-form';
    textSelectAll.className = 'jp-SimSelectForm-text';

    // Define structure of HTML elements.
    label.appendChild(textSelectItem);
    label.appendChild(inputSelectItem);
    label.appendChild(divSelectAll);
    divSelectAll.appendChild(inputSelectAll);
    divSelectAll.appendChild(textSelectAll);

    node.appendChild(label);
    return node;
  }

  /**
   * Returns the user selection.
   */
  getValue(): SimSelectForm.IReturnValue {
    // Get input elements.
    const inputNodesList = this.node.querySelectorAll('input');

    // Get value from checkbox for selecting all items.
    const selectAll = inputNodesList[0].checked;

    if (true === selectAll) {
      // Check if all items have been selected ...
      return {
        selectAll: true
      };
    } else {
      // ... otherwise retrieve selected item.
      // Get selector field and selected items.
      const selectNodesList = this.node.querySelectorAll('select');
      const selectItem = selectNodesList[0].value;
      return {
        selectAll: false,
        selectItem: selectItem
      };
    }
  }
}
