import {
  Input,
  EventEmitter,
  ElementRef,
  ChangeDetectorRef,
  Directive
} from '@angular/core';
import { coerceBoolean } from '@app/utilities';
import { McsUniqueId } from '@app/core';

@Directive({
  selector: '[mcsResponsivePanelItem]',
  host: {
    'class': 'responsive-panel-item-wrapper',
    '[class.active]': 'active',
    '[class.selectable]': 'selectable',
    '(click)': 'onClick()',
    '[attr.id]': 'id'
  }
})

export class ResponsivePanelItemDirective {
  /**
   * Event that emits when selection is changed
   */
  public selectionChange: EventEmitter<any>;

  @Input()
  public id: string = McsUniqueId.NewId('responsive-panel-item');

  @Input('mcsResponsivePanelItemSelectable')
  public get selectable(): boolean { return this._selectable; }
  public set selectable(value: boolean) {
    this._selectable = coerceBoolean(value);
  }
  private _selectable: boolean = false;

  /**
   * Tab header item flag to determine if the tab is selected
   */
  @Input()
  public get active(): boolean { return this._active; }
  public set active(value: boolean) {
    if (this._active !== value) {
      this._active = coerceBoolean(value);
      if (this._active) {
        this.selectionChange.next(this);
      }
      this.changeDetectorRef.markForCheck();
    }
  }
  private _active: boolean;

  constructor(
    private _elementRef: ElementRef,
    public changeDetectorRef: ChangeDetectorRef
  ) {
    this.selectionChange = new EventEmitter();
  }

  /**
   * Returns the element reference of the component
   */
  public get elementRef(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  /**
   * Event that triggers when the component is clicked
   */
  public onClick(): void {
    this.selectionChange.next(this);
  }
}
