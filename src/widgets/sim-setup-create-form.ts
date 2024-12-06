import { Widget } from '@lumino/widgets';

/**
 * This widget displays a dialog that lets users enter the name
 * of a new simulation setup. This dialog is used by the command
 * for creating new simulation setups.
 */
export class SimSetupCreateForm extends Widget {
  /**
   * Returns an instance of the SimSetupCreateForm class.
   * @returns widget instance
   */
  constructor() {
    super({ node: SimSetupCreateForm._createFormNode() });
  }

  /**
   * Create the HTML element for the widget.
   * @private
   * @returns HTML element
   */
  private static _createFormNode(): HTMLElement {
    // Create HTML elements.
    const node = document.createElement('div');
    const input = document.createElement('input');
    const text = document.createElement('span');

    // Set CSS class name.
    node.className = 'jp-RedirectForm';

    // Set display text.
    text.textContent =
      'Enter the name of the new mosaik-docker simulation setup:';

    // Set placeholder for input field.
    input.placeholder = SimSetupCreateForm._defaultSetupName;

    // Define structure of HTML elements.
    node.appendChild(text);
    node.appendChild(input);

    return node;
  }

  /**
   * Returns the input value (using the placeholder value as default).
   */
  getValue(): string {
    // Retrieve input field.
    const input = this.node.querySelector('input');

    if (input) {
      const value = input.value;
      // Return user input or default value.
      return value === '' ? SimSetupCreateForm._defaultSetupName : value;
    }

    return SimSetupCreateForm._defaultSetupName;
  }

  /** Default value for simulation setup name (also used as placeholder in the widget). */
  private static _defaultSetupName = 'mosaik-docker-sim';
}
