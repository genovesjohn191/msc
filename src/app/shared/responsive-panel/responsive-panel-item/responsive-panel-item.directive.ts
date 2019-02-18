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
    '[class.active]': 'selected',
    '[class.selectable]': 'selectable',
    '(click)': 'onClick()',
    '[attr.id]': 'id'
  }
})

export class ResponsivePanelItemDirective {
  public selected: boolean;

  /**
   * Event that emits when selection is changed
   */
  public selectionChange: EventEmitter<ResponsivePanelItemDirective>;
  public clickChange = new EventEmitter<ResponsivePanelItemDirective>();

  @Input()
  public id: string = McsUniqueId.NewId('responsive-panel-item');

  @Input('mcsResponsivePanelItemSelectable')
  public get selectable(): boolean { return this._selectable; }
  public set selectable(value: boolean) {
    this._selectable = coerceBoolean(value);
  }
  private _selectable: boolean = false;

  constructor(
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef
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
    this.clickChange.next(this);
  }

  /**
   * Selects the responsive panel item
   */
  public select(): void {
    this.selected = true;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Deselects the responsive panel item
   */
  public deselect(): void {
    this.selected = false;
    this._changeDetectorRef.markForCheck();
  }
}
