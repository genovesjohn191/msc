import {
  Component,
  Input,
  Output,
  ContentChildren,
  QueryList,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { SelectTagSubItemComponent } from '../select-tag-sub-item/select-tag-sub-item.component';
import { CoreDefinition } from '../../../core';

// Unique Id that generates during runtime
let nextUniqueId = 0;

@Component({
  selector: 'mcs-select-tag-main-item',
  templateUrl: './select-tag-main-item.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('indicatorIcon', [
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      state('expanded', style({ transform: 'rotate(90deg)' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4,0.0,0.2,1)'))
    ]),
  ],
  host: {
    'class': 'select-tag-main-item-wrapper',
    '[class.selected]': 'selected',
    '(click)': 'onClick($event)'
  }
})

export class SelectTagMainItemComponent {

  public id: string = `mcs-select-tag-main-item-${nextUniqueId++}`;

  @Input()
  public header: string;

  @Output()
  public selectionChanged = new EventEmitter<SelectTagMainItemComponent>();

  @ContentChildren(SelectTagSubItemComponent)
  public subItems: QueryList<SelectTagSubItemComponent>;

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

  public get toggleAnimation(): string {
    return this.selected ? 'expanded' : 'collapsed';
  }

  public get caretIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CARET_RIGHT;
  }

  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
  }

  /**
   * Notify angular to refresh the view of this component
   */
  public markForCheck(): void {
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Select this main item
   */
  public select(): void {
    this.selected = true;
  }

  /**
   * Deselect this main item
   */
  public deselect(): void {
    this.selected = false;
  }

  /**
   * Event that emits when the main item is clicked
   * @param _event Mouse event
   */
  public onClick(_event: any): void {
    this.select();
    this._emitSelectionChanged();
    _event.stopPropagation();
  }

  private _emitSelectionChanged(): void {
    this.selectionChanged.emit(this);
  }
}
