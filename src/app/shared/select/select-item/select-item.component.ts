import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  AfterContentInit,
  QueryList,
  ContentChildren,
  ElementRef,
  ViewChild
} from '@angular/core';
import { CoreDefinition } from '../../../core';
import {
  isNullOrEmpty,
  animateFactory,
  isElementVisible
} from '../../../utilities';
import { SelectGroupComponent } from '../select-group/select-group.component';

// Unique Id that generates during runtime
let nextUniqueId = 0;

@Component({
  selector: 'mcs-select-item',
  templateUrl: './select-item.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.expansionVertical,
    animateFactory.rotate90
  ],
  host: {
    'class': 'select-item-wrapper',
    'role': 'option',
    '[class.sub-group]': 'hasSubgroup',
    '[class.sub-group-expanded]': 'subGroupOpen',
    '[class.active]': 'active',
    '[class.selected]': 'selected',
    '[id]': 'id'
  }
})

export class SelectItemComponent implements AfterContentInit {

  public recreate: boolean = true;

  @Input()
  public value: any;
  public get viewValue(): string {
    return (this._elementRef.nativeElement.textContent || '').trim();
  }

  @Output()
  public itemSelectionChanged = new EventEmitter<SelectItemComponent>();

  @Output()
  public groupSelectionChanged = new EventEmitter<SelectItemComponent>();

  @ContentChildren(SelectGroupComponent)
  public groups: QueryList<SelectGroupComponent>;

  @Input()
  public id: string = `mcs-select-item-${nextUniqueId++}`;

  @ViewChild('triggerElement')
  public triggerElement: ElementRef;

  /**
   * Sub group open flag determines wheather the sub-group is open or not
   */
  private _subGroupOpen: boolean = false;
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
  public get selected(): boolean { return this._selected; }
  public set selected(value: boolean) {
    if (this._selected !== value) {
      this._selected = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Return true when the item is active, otherwise false
   */
  private _active: boolean;
  public get active(): boolean { return this._active; }
  public set active(value: boolean) {
    if (this._active !== value) {
      this._active = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef
  ) {
    this.itemSelectionChanged = new EventEmitter<any>();
  }

  /**
   * Returns the carrent icon key
   */
  public get carretRightIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CARET_RIGHT;
  }

  /**
   * Returns the current value of the rotation
   */
  public get transformRotate(): string {
    // Note: We need to manually set this in order to fix
    // the issue related in angular when recreating the element
    // the animate is not triggered correctly.
    return this.subGroupOpen ? 'rotate(90deg)' : 'rotate(0deg)';
  }

  public ngAfterContentInit(): void {
    this.hasSubgroup = this.groups.length !== 0;
  }

  /**
   * Returns the host element instance
   */
  public getHostElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  /**
   * Returns the trigger element instance
   */
  public getTriggerElement(): HTMLElement {
    return this.triggerElement.nativeElement;
  }

  /**
   * Event that emits when click is executed on the trigger element
   */
  public onClickItem(_event: any): void {
    if (!isNullOrEmpty(_event)) { _event.stopPropagation(); }
    this.hasSubgroup ? this.groupSelectionChanged.emit(this) :
      this.itemSelectionChanged.emit(this);
  }

  /**
   * Closes the group panel element
   */
  public closeGroupPanel(): void {
    this.subGroupOpen = false;
  }

  /**
   * Opens the group panel element
   */
  public openGroupPanel(): void {
    this.subGroupOpen = true;
  }

  /**
   * Toggles the group panel element
   */
  public toggleGroupPanel(): void {
    this.subGroupOpen ? this.closeGroupPanel() : this.openGroupPanel();
  }

  /**
   * Selects the current item
   */
  public select(): void {
    this.selected = true;
  }

  /**
   * Deselects the current item
   */
  public deselect(): void {
    this.selected = false;
  }

  /**
   * Sets this item to active state
   */
  public setActiveState(): void {
    this.active = true;
  }

  /**
   * Removes this item to active state
   */
  public setInActiveState(): void {
    this.active = false;
  }

  /**
   * Returns true when this item is visible
   */
  public isVisible(): boolean {
    return isElementVisible(this.getHostElement());
  }
}
