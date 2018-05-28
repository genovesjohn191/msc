import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  EventEmitter,
  ChangeDetectorRef,
  ElementRef
} from '@angular/core';
import {
  isNullOrEmpty,
  isElementVisible,
  coerceBoolean
} from '../../../utilities';

// Unique Id that generates during runtime
let nextUniqueId = 0;

@Component({
  selector: 'mcs-option',
  templateUrl: './option.component.html',
  styleUrls: ['./option.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'option-wrapper',
    'role': 'option',
    '[id]': 'id',
    '[attr.tabindex]': '0',
    '[class.option-selected]': 'selected',
    '[class.option-active]': 'active',
    '(click)': 'onClick($event)'
  }
})

export class OptionComponent {
  /**
   * Event emitted when the option is selected or deselected
   */
  public selectionChange = new EventEmitter<OptionComponent>();

  @Input()
  public id: string = `mcs-option-${nextUniqueId++}`;

  @Input()
  public value: any;
  public get viewValue(): string {
    return (this._elementRef.nativeElement.textContent || '').trim();
  }

  /**
   * Returns true when option is currently selected
   */
  @Input()
  public get selected(): boolean { return this._selected; }
  public set selected(value: boolean) {
    this._selected = coerceBoolean(value);

    // We need to check if the option selected state is true
    // to mitigate the problem of collapsing other group panel
    // because the click event will notify the subscribers
    // and we don't want to emit the selection stream twice
    if (value) { this.selectionChange.emit(this); }
  }
  private _selected: boolean;

  /**
   * Returns true when option is currently active
   */
  private _active: boolean;
  public get active(): boolean { return this._active; }

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef
  ) { }

  /**
   * Returns the associated host element of the component
   */
  public get hostElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  /**
   * Returns true when this item is visible
   */
  public isVisible(): boolean {
    return isElementVisible(this.hostElement);
  }

  /**
   * Selects the option
   */
  public select(): void {
    this._selected = true;
    this._changeDetectorRef.markForCheck();
    this.selectionChange.emit(this);
  }

  /**
   * Deselects the option
   */
  public deselect(): void {
    this._selected = false;
    this._changeDetectorRef.markForCheck();
    this.selectionChange.emit(this);
  }

  /**
   * Removes the selected state and will not notify the selectionChange event
   */
  public removeSelectedState(): void {
    this._selected = false;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Sets the active state of the option
   */
  public setActiveState(): void {
    this._active = true;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Clears the active state of the option
   */
  public setInActiveState(): void {
    this._active = false;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event that emits when this component is clicked
   * @param event Mouse event instance
   */
  public onClick(event?: MouseEvent): void {
    if (!isNullOrEmpty(event)) { event.stopPropagation(); }
    this.select();
  }
}