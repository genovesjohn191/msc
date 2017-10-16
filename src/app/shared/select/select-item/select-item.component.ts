import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  AfterContentInit,
  OnDestroy,
  QueryList,
  ContentChildren,
  ElementRef
} from '@angular/core';
import { CoreDefinition } from '../../../core';
import {
  registerEvent,
  unregisterEvent
} from '../../../utilities';
import { SelectGroupComponent } from '../select-group/select-group.component';

// Unique Id that generates during runtime
let nextUniqueId = 0;

@Component({
  selector: 'mcs-select-item',
  templateUrl: './select-item.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'select-item-wrapper',
    '[id]': 'id',
    '(click)': 'onClickItem($event)'
  }
})

export class SelectItemComponent implements AfterContentInit, OnDestroy {

  @Input()
  public value: any;
  public get viewValue(): string {
    return (this._elementRef.nativeElement.textContent || '').trim();
  }

  @Output()
  public selectionChanged = new EventEmitter<any>();

  @ContentChildren(SelectGroupComponent)
  public groups: QueryList<SelectGroupComponent>;

  public id: string = `mcs-option-${nextUniqueId++}`;

  /**
   * Sub group open flag determines wheather the sub-group is open or not
   */
  private _subGroupOpen: boolean;
  public get subGroupOpen(): boolean {
    return this._subGroupOpen;
  }
  public set subGroupOpen(value: boolean) {
    if (this._subGroupOpen !== value) {
      this._subGroupOpen = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Return true when the item has sub-group tag, otherwise false
   */
  private _hasSubgroup: boolean;
  public get hasSubgroup(): boolean {
    return this._hasSubgroup;
  }
  public set hasSubgroup(value: boolean) {
    if (this._hasSubgroup !== value) {
      this._hasSubgroup = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Return true when the item is selected, otherwise false
   */
  private _selected: boolean;
  public get selected(): boolean {
    return this._selected;
  }
  public set selected(value: boolean) {
    if (this._selected !== value) {
      this._selected = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Event handler references
   */
  private _openSubgroupHandler = this._onOpenSubgroup.bind(this);
  private _closeSubgroupHandler = this._onCloseSubgroup.bind(this);

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef
  ) {
    this.selectionChanged = new EventEmitter<any>();
  }

  public get carretRightIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CARET_RIGHT;
  }

  public ngAfterContentInit(): void {
    this.hasSubgroup = this.groups.length !== 0;
    this._registerEvents();
  }

  public ngOnDestroy(): void {
    this._unregisterEvents();
  }

  public onClickItem(_event: any): void {
    if (this.hasSubgroup) { return; }
    this.select();
    this._emitSelectionChanged();
    _event.stopPropagation();
  }

  public select(): void {
    if (this.hasSubgroup) { return; }
    this.selected = true;
  }

  public deselect(): void {
    this.selected = false;
    this.subGroupOpen = false;
  }

  private _registerEvents(): void {
    if (!this.hasSubgroup) { return; }
    registerEvent(this._elementRef.nativeElement, 'mouseenter', this._openSubgroupHandler);
    registerEvent(this._elementRef.nativeElement, 'mouseleave', this._closeSubgroupHandler);
  }

  private _unregisterEvents(): void {
    if (!this.hasSubgroup) { return; }
    unregisterEvent(this._elementRef.nativeElement, 'mouseenter', this._openSubgroupHandler);
    unregisterEvent(this._elementRef.nativeElement, 'mouseleave', this._closeSubgroupHandler);
  }

  private _onOpenSubgroup(): void {
    this.subGroupOpen = true;
  }

  private _onCloseSubgroup(): void {
    this.subGroupOpen = false;
  }

  private _emitSelectionChanged(): void {
    this.selectionChanged.emit(this);
  }
}
