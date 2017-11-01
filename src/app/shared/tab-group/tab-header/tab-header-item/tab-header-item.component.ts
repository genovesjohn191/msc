import {
  Component,
  Input,
  EventEmitter,
  ElementRef,
  ChangeDetectorRef,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'mcs-tab-header-item',
  template: `<ng-content></ng-content>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'tab-header-item-wrapper',
    '[class.active]': 'active'
  }
})

export class TabHeaderItemComponent {
  /**
   * Event that emits when selection is changed
   */
  public selectionChanged: EventEmitter<any>;

  /**
   * Tab header item flag to determine if the tab is selected
   */
  @Input()
  public get active(): boolean {
    return this._active;
  }
  public set active(value: boolean) {
    if (this._active !== value) {
      this._active = value;
      if (value === true) {
        this.selectionChanged.next(this);
      }
      this.changeDetectorRef.markForCheck();
    }
  }
  private _active: boolean;

  constructor(
    public elementRef: ElementRef,
    public changeDetectorRef: ChangeDetectorRef
  ) {
    this.selectionChanged = new EventEmitter();
  }
}
