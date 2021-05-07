import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { McsOption } from '@app/models';

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

export class OrderListBoxComponent {
  @Input()
  public get categoryList(): McsOption[] { return this._categoryList; }
  public set categoryList(value: McsOption[]) {
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

  @Output()
    public categoryChange: EventEmitter<McsOption> = new EventEmitter<McsOption>(null);

  @Output()
    public selectedItemChange: EventEmitter<McsOption> = new EventEmitter<McsOption>(null);

  private _categoryList: McsOption[];
  private _selectedItemList: McsOption[];
  public selectedCategory: string;
  public selectedItem: string;

  public onClickCategory(category: McsOption): void {
    this.selectedCategory = category?.text;
    this.selectedItem = '';
    this.categoryChange.emit(category);
  }

  public onClickSelectedItem(item: McsOption): void {
    this.selectedItem = item?.value;
    this.selectedItemChange.emit(item);
  }
}