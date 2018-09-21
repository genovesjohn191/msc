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
  isElementVisible,
  coerceBoolean
} from '@app/utilities';

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
    '(click)': 'select()'
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
    if (value !== this._selected) {
      this._selected = coerceBoolean(value);
      this.selectionChange.emit(this);
    }
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
    this.selected = true;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Deselects the option
   */
  public deselect(): void {
    this.selected = false;
    this._changeDetectorRef.markForCheck();
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
}
