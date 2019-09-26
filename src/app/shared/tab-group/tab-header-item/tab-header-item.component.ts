import {
  Component,
  Input,
  EventEmitter,
  ElementRef,
  ChangeDetectorRef,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ContentChild,
  Optional,
} from '@angular/core';
import {
  coerceBoolean,
  McsAlignmentType,
  isNullOrEmpty
} from '@app/utilities';
import {
  ResponsivePanelItemDirective
} from '../../responsive-panel/responsive-panel-item/responsive-panel-item.directive';

@Component({
  selector: 'mcs-tab-header-item',
  template: `<ng-content></ng-content>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'tab-header-item-wrapper',
    '[id]': 'id',
    '[class.active]': 'active',
    '[class.align-start]': 'align === "start"',
    '[class.align-center]': 'align === "center"',
    '[class.align-end]': 'align === "end"'
  }
})

export class TabHeaderItemComponent {
  /**
   * Event that emits when selection is changed
   */
  public selectionChanged: EventEmitter<any>;

  @Input()
  public id: string;

  @Input()
  public align: McsAlignmentType;

  /**
   * Tab header item flag to determine if the tab is selected
   */
  @Input()
  public get active(): boolean { return this._active; }
  public set active(value: boolean) {
    if (this._active !== value) {
      this._active = coerceBoolean(value);
      if (this._active) {
        this.selectionChanged.next(this);
        this._selectResponsivePanel();
      }
      this.changeDetectorRef.markForCheck();
    }
  }
  private _active: boolean;

  @ContentChild(ResponsivePanelItemDirective, { static: false })
  private _responsivePanelItem: ResponsivePanelItemDirective;

  constructor(
    public elementRef: ElementRef,
    public changeDetectorRef: ChangeDetectorRef,
    @Optional() private _responsiveItem: ResponsivePanelItemDirective
  ) {
    this.selectionChanged = new EventEmitter();
  }

  /**
   * Returns the responsive panel item
   */
  public get responsiveItem(): ResponsivePanelItemDirective {
    return this._responsiveItem;
  }

  /**
   * Select the corresponding active panel item
   */
  private _selectResponsivePanel(): void {
    if (isNullOrEmpty(this._responsivePanelItem)) { return; }
    this._responsivePanelItem.onClick();
  }
}
