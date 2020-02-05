import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  EventEmitter,
  ChangeDetectorRef,
  ElementRef,
  OnDestroy
} from '@angular/core';
import {
  isElementVisible,
  coerceBoolean,
  unsubscribeSafely
} from '@app/utilities';
import { McsUniqueId } from '@app/core';

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
    '[class.option-selected]': 'selected',
    '[class.option-active]': 'active',
    '[class.option-checkable]': 'checkable',
    '[class.option-disabled]': 'disabled',
    '[class.hide-element]': 'hidden',
    '(click)': 'onClickOption()'
  }
})

export class OptionComponent implements OnDestroy {
  public selectionChange = new EventEmitter<OptionComponent>();
  public activeChange = new EventEmitter<OptionComponent>();
  public clickChange = new EventEmitter<OptionComponent>();
  public visibilityChange = new EventEmitter<OptionComponent>();
  public checkable = false;
  public hidden = false;

  @Input()
  public id: string = McsUniqueId.NewId('option');

  @Input()
  public get disabled(): boolean { return this._disabled; }
  public set disabled(value: boolean) { this._disabled = coerceBoolean(value); }
  private _disabled: boolean = false;

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
  public set active(value: boolean) {
    if (value !== this._active) {
      this._active = coerceBoolean(value);
      this.activeChange.emit(this);
    }
  }

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef
  ) { }

  public ngOnDestroy() {
    unsubscribeSafely(this.selectionChange);
    unsubscribeSafely(this.activeChange);
    unsubscribeSafely(this.clickChange);
    unsubscribeSafely(this.visibilityChange);
  }

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
   * Shows the checkbox of the option
   */
  public showCheckbox(): void {
    this.checkable = true;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Hides the checkbox of the option
   */
  public hideCheckbox(): void {
    this.checkable = false;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event handler that gets emitted when the option was clicked
   */
  public onClickOption(): void {
    if (this.disabled) { return; }
    this.clickChange.next(this);
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
   * Shows the option element to make it visible on the DOM
   */
  public show(): void {
    this.hidden = false;
    this.visibilityChange.next(this);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Hides the option element only without removing it from the DOM
   */
  public hide(): void {
    this.hidden = true;
    this.visibilityChange.next(this);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Toggles the option
   */
  public toggle(): void {
    this.selected ? this.deselect() : this.select();
  }

  /**
   * Sets the active state of the option
   */
  public setActiveState(): void {
    this.active = true;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Clears the active state of the option
   */
  public setInActiveState(): void {
    this.active = false;
    this._changeDetectorRef.markForCheck();
  }
}
