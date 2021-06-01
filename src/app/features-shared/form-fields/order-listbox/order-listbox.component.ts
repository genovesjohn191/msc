import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Injector,
  Input,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { McsOption } from '@app/models';
import { FormFieldBaseComponent2 } from '../abstraction/form-field.base';

@Component({
  selector: 'mcs-order-listbox',
  templateUrl: './order-listbox.component.html',
  styleUrls: ['./order-listbox.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'order-listbox-wrapper'
  }
})

export class OrderListBoxComponent extends FormFieldBaseComponent2<McsOption> {
  @Input()
  public get categoryList(): McsOption[] { return this._categoryList; }
  public set categoryList(value: McsOption[]) {
    this._selectedCategory = null;
    if (this._categoryList !== value) {
      this._categoryList = value;
    }
  }

  @Input()
  public get selectedItemList(): McsOption[] { return this._selectedItemList; }
  public set selectedItemList(value: McsOption[]) {
    if (this._selectedItemList !== value) {
      this._selectedItemList = value;
    }
  }

  @Input()
  public get selectedCategory(): McsOption { return this._selectedCategory; }
  public set selectedCategory(value: McsOption) {
    if (this._selectedCategory !== value) {
      this._selectedCategory = value;
      this.categoryChange.emit(value);
    }
  }

  @Input()
    public isProcessing: boolean;

  @Input()
    public categoryId: string;

  @Input()
    public selectedItemId: string;

  @Input()
    public categoryEventTracker: string;

  @Input()
    public selectedItemEventTracker: string;

  @Input()
    public eventCategory: string;

  @Input()
    public eventLabel: string;

  @Input()
    public noItemsFallbackText: string;

  @Output()
    public categoryChange: EventEmitter<McsOption> = new EventEmitter<McsOption>(null);

  @Output()
    public selectedItemChange: EventEmitter<McsOption> = new EventEmitter<McsOption>(null);

  private _categoryList: McsOption[];
  private _selectedItemList: McsOption[];
  public _selectedCategory: McsOption;
  public selectedItem: string;

  constructor(_injector: Injector) {
    super(_injector);
  }

  public onClickCategory(category: McsOption): void {
    this._selectedCategory = category;
    this.selectedItem = '';
    this.categoryChange.emit(category);
  }

  public onClickSelectedItem(item: McsOption): void {
    this.selectedItem = item?.value;
    this.selectedItemChange.emit(item);
    this.writeValue(item?.value);
  }
}