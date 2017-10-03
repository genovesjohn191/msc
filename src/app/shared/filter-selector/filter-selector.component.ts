import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import {
  McsStorageService,
  McsFilterProvider
} from '../../core';
import { isNullOrEmpty } from '../../utilities';

@Component({
  selector: 'mcs-filter-selector',
  templateUrl: './filter-selector.component.html',
  styles: [require('./filter-selector.component.scss')],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'filter-selector-wrapper'
  }
})

export class FilterSelectorComponent implements OnInit {
  @Input()
  public key: string;

  @Output()
  public onGetFilters: EventEmitter<any>;

  /**
   * Filter Items based on the filter-configuration definition
   */
  private _filterItems: any;
  public get filterItems(): any {
    return this._filterItems;
  }
  public set filterItems(value: any) {
    if (this._filterItems !== value) {
      this._filterItems = value;
    }
  }

  public constructor(
    private _mcsStorageService: McsStorageService,
    private _filterProvider: McsFilterProvider
  ) {
    this.key = '';
    this.onGetFilters = new EventEmitter();
  }

  public get filterKeys(): any {
    return Object.keys(this.filterItems);
  }

  public ngOnInit() {
    this._getFilterItems();
    this.onNotifyGetFilters();
  }

  /**
   * Notify the outside subscribers that the filter has been changed
   */
  public onNotifyGetFilters(): void {
    this._mcsStorageService.setItem(this.key, this.filterItems);
    this.onGetFilters.emit(this.filterItems);
  }

  /**
   * Get the filter items in the storage or default filter settings
   */
  private _getFilterItems(): void {
    this.filterItems = this._mcsStorageService.getItem<any>(this.key);
    if (!this.filterItems) {
      this.filterItems = this._filterProvider.getDefaultFilters(this.key);
    }
  }
}
