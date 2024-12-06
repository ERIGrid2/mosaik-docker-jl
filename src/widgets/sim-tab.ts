import { ILayoutRestorer, JupyterFrontEnd } from '@jupyterlab/application';

import { CommandPaletteSvg } from '@jupyterlab/ui-components';

import { ArrayExt } from '@lumino/algorithm';

import { JSONExt, ReadonlyJSONObject } from '@lumino/coreutils';

import { CommandRegistry } from '@lumino/commands';

import { Message } from '@lumino/messaging';

import { VirtualDOM, VirtualElement } from '@lumino/virtualdom';

import { CommandPalette, Widget } from '@lumino/widgets';

import { IMosaikDockerExtension } from '../tokens';

import { CommandIDs } from '../command-ids';

import { mosaikDockerIcon } from '../style/icons';

export namespace CommandItem {
  /** Define the initialization options for class CommandItem. */
  export interface IOptions extends CommandPalette.IItemOptions {
    /** JupyterLab command registry. */
    commands: CommandRegistry;
  }
}

/**
 * A concrete implementation of `CommandPalette.IItem`.
 * Intended for use with class SimCommandTab.
 */
export class CommandItem implements CommandPalette.IItem {
  /**
   * Construct a new command item.
   * @param options - command item initialization options
   * @returns command item instance
   */
  constructor(options: CommandItem.IOptions) {
    // Store a reference to the JupyterLab command registry.
    this._commands = options.commands;

    // Set the command category.
    this.category = this._normalizeCategory(options.category);

    // Set the toggleable flag.
    this.isToggleable = false;

    // Set the command.
    this.command = options.command;

    // Optional: store command arguments.
    this.args = options.args || JSONExt.emptyObject;

    // Optional: set command display rank.
    this.rank = options.rank !== undefined ? options.rank : Infinity;
  }

  /**
   * The category for the command item.
   */
  readonly category: string;

  /**
   * The command to execute when the item is triggered.
   */
  readonly command: string;

  /**
   * The arguments for the command.
   */
  readonly args: ReadonlyJSONObject;

  /**
   * The rank for the command item.
   */
  readonly rank: number;

  /**
   * Flag for toggleable items.
   */
  readonly isToggleable: boolean;

  /**
   * The display label for the command item.
   */
  get label(): string {
    return this._commands.label(this.command, this.args);
  }

  /**
   * The icon renderer for the command item.
   */
  get icon():
    | VirtualElement.IRenderer
    | undefined /* <DEPRECATED> */ {
    return this._commands.icon(this.command, this.args);
  }

  /**
   * The icon class for the command item.
   */
  get iconClass(): string {
    return 'jp-SideTab-itemIcon';
  }

  /**
   * The icon label for the command item.
   */
  get iconLabel(): string {
    return this._commands.iconLabel(this.command, this.args);
  }

  /**
   * The display caption for the command item.
   */
  get caption(): string {
    return this._commands.caption(this.command, this.args);
  }

  /**
   * The extra class name for the command item.
   */
  get className(): string {
    //return this._commands.className( this.command, this.args );
    return 'jp-SideTab-item';
  }

  /**
   * The dataset for the command item.
   */
  get dataset(): CommandRegistry.Dataset {
    return this._commands.dataset(this.command, this.args);
  }

  /**
   * Whether the command item is enabled.
   */
  get isEnabled(): boolean {
    return this._commands.isEnabled(this.command, this.args);
  }

  /**
   * Whether the command item is toggled.
   */
  get isToggled(): boolean {
    return this._commands.isToggled(this.command, this.args);
  }

  /**
   * Whether the command item is visible.
   */
  get isVisible(): boolean {
    return this._commands.isVisible(this.command, this.args);
  }

  /**
   * The key binding for the command item.
   */
  get keyBinding(): CommandRegistry.IKeyBinding | null {
    return null;
  }

  /**
   * Normalize a category for a command item.
   */
  private _normalizeCategory(category: string): string {
    return category.trim().replace(/\s+/g, ' ');
  }

  /** Reference to JupyterLab command registry. */
  private _commands: CommandRegistry;
}

export namespace SimCommandTab {
  /** Define the initialization options for class SimCommandTab. */
  export interface IOptions {
    /** The command registry for use with the command side bar tab. */
    commands: CommandRegistry;

    /** The category for use with the command side bar tab. */
    category: string;

    /** A custom renderer for use with the command side bar tab. */
    renderer: CommandPalette.IRenderer;

    /** mosaik-docker extension model. */
    model: IMosaikDockerExtension;
  }
}

/**
 * This widget displays the mosaik-docker commands in a side bar tab.
 */
export class SimCommandTab extends Widget {
  /**
   * Construct a new command side bar tab.
   * @param options - The options for initializing the side bar tab.
   * @returns widget instance
   */
  constructor(options: SimCommandTab.IOptions) {
    super({ node: SimCommandTab._createNode() });

    // Set title icon.
    this.title.icon = mosaikDockerIcon;

    // Set title caption.
    this.title.caption = 'Mosaik Commands';

    // Reuse CSS class from CommandPalette.
    this.addClass('lm-CommandPalette');

    // Set CSS id.
    this.id = 'mosaik-docker-sim-tab';

    // Save reference to JupyterLab commands registry.
    this.commands = options.commands;

    // Set renderer.
    this.renderer = options.renderer || CommandPalette.defaultRenderer;

    // Set category (only one category for all commands).
    this._category = options.category;

    // Connect the widget's update method to changes of the mosaik-extension model.
    options.model.modelChanged.connect(this.update, this);
  }

  /**
   * Dispose of the resources held by the widget.
   */
  dispose(): void {
    this._items.length = 0;
    super.dispose();
  }

  /**
   * The command registry used by the command side bar tab.
   */
  readonly commands: CommandRegistry;

  /**
   * The renderer used by the command side bar tab.
   */
  readonly renderer: CommandPalette.IRenderer;

  /**
   * The command side bar tab category node, which displays the category title.
   */
  get categoryNode(): HTMLDivElement {
    return this.node.getElementsByClassName(
      'lm-CommandPalette-category'
    )[0] as HTMLDivElement;
  }

  /**
   * The command side bar tab content node, which holds the command item nodes.
   */
  get contentNode(): HTMLUListElement {
    return this.node.getElementsByClassName(
      'jp-SideTab-content'
    )[0] as HTMLUListElement;
  }

  /**
   * A read-only array of the command items in the side bar tab.
   */
  get items(): ReadonlyArray<CommandPalette.IItem> {
    return this._items;
  }

  /**
   * Add a command item to the command side bar tab.
   * @param options - options for creating the command item
   * @returns The command item added to the side bar tab
   */
  addItem(command: string): CommandPalette.IItem {
    const category = this._category;
    const options = { commands: this.commands, command, category };

    // Create a new command item for the options.
    const item = new CommandItem(options);

    // Add the item to the array.
    this._items.push(item);

    // Update the widget.
    this.update();

    // Return the item added to the side bar tab.
    return item;
  }

  /**
   * Handle the DOM events for the command side bar tab.
   * @param event - The DOM event sent to the command side bar tab.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the command side bar tab's DOM node.
   * It should not be called directly by user code.
   */
  handleEvent(event: Event): void {
    switch (event.type) {
      case 'click':
        this._evtClick(event as MouseEvent);
        break;
    }
  }

  /**
   * A message handler invoked on a `'before-attach'` message.
   */
  protected onBeforeAttach(msg: Message): void {
    this.node.addEventListener('click', this);
  }

  /**
   * A message handler invoked on an `'after-detach'` message.
   */
  protected onAfterDetach(msg: Message): void {
    this.node.removeEventListener('click', this);
  }

  /**
   * A message handler invoked on an `'update-request'` message.
   */
  protected onUpdateRequest(msg: Message): void {
    const header = new Array<VirtualElement>(1);
    const category = this._category;
    const indices: ReadonlyArray<number> = [];
    header[0] = this.renderer.renderHeader({ category, indices });

    VirtualDOM.render(header, this.categoryNode);

    const content = new Array<VirtualElement>(this._items.length);
    for (let i = 0, n = this._items.length; i < n; ++i) {
      const item = this._items[i];
      const indices: ReadonlyArray<number> = [];
      const active = false;
      content[i] = this.renderer.renderItem({ item, indices, active });
    }

    VirtualDOM.render(content, this.contentNode);
  }

  /**
   * Handle the `'click'` event for the command side bar tab.
   * @param event - mouse event
   */
  private _evtClick(event: MouseEvent): void {
    // Bail if the click is not the left button.
    if (event.button !== 0) {
      return;
    }

    // Find the index of the item which was clicked.
    const index = ArrayExt.findFirstIndex(this.contentNode.children, node => {
      return node.contains(event.target as HTMLElement);
    });

    // Bail if the click was not on an item.
    if (index === -1) {
      return;
    }

    // Kill the event when a content item is clicked.
    event.preventDefault();
    event.stopPropagation();

    // Execute the item if possible.
    this._execute(index);
  }

  /**
   * Execute the command item at the given index, if possible.
   * @param index - position index of command in the side tab
   */
  private _execute(index: number): void {
    const item = this._items[index];

    // Bail if the index is out of range.
    if (!item) {
      return;
    }

    // Bail if item is not enabled.
    if (!item.isEnabled) {
      return;
    }

    // Execute the item.
    this.commands.execute(item.command, item.args);

    this.update();
  }

  /**
   * Create the DOM node for a command side bar tab.
   * @private
   * @returns HTML div element
   */
  private static _createNode(): HTMLDivElement {
    const node = document.createElement('div');
    const header = document.createElement('div');
    const content = document.createElement('ul');
    header.className = 'lm-CommandPalette-category';
    content.className = 'jp-SideTab-content';
    node.appendChild(header);
    node.appendChild(content);
    return node;
  }

  /** The (only) command tab category. */
  private _category: string;

  /** Array of command palette items. */
  private _items: CommandPalette.IItem[] = [];
}

/**
 * Add new side tab for displaying mosaik-docker commands
 * @param app - JupyterLab frontend
 * @param model - mosaik-docker extension model
 * @param restorer - JupyterLab layout restorer
 */
export function addSimTab(
  app: JupyterFrontEnd,
  model: IMosaikDockerExtension,
  restorer: ILayoutRestorer | null
): void {
  // Retrieve JupyterLab command registry and shell.
  const { commands, shell } = app;

  // Specify side tab category.
  const category = 'mosaik-docker Commands';

  // Specify side tab renderer (re-use renderer from CommandPaletteSvg).
  const renderer = CommandPaletteSvg.defaultRenderer;

  // Instantiate new side tab.
  const simTab = new SimCommandTab({ commands, category, renderer, model });

  // Add mosaik-docker commands to side tab.
  CommandIDs.all.forEach(command => {
    simTab.addItem(command);
  });

  // Add new side tab to JupyterLab shell.
  shell.add(simTab, 'left', { rank: 300 });

  // If available, add the widget to the layout restorer.
  if (restorer) {
    restorer.add(simTab, 'sim-tab');
  }
}
