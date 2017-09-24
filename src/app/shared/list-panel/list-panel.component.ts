import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  AfterContentInit,
  AfterContentChecked,
  ViewChild,
  ContentChild,
  ChangeDetectorRef,
  Renderer2,
  ElementRef,
  NgIterable,
  IterableDiffer,
  IterableDiffers,
  TrackByFunction,
  IterableChangeRecord,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  HostBinding
} from '@angular/core';
import { Observable } from 'rxjs/Rx';
/** Core / Utilities */
import {
  McsDataSource,
  McsDataStatus,
  McsListPanelItem
} from '../../core';
import {
  isNullOrEmpty,
  refreshView
} from '../../utilities';
/** List panel directives */
import { ListItemsPlaceholderDirective } from './shared';
import { ListDefDirective } from './list-definition';
import { ListItemOutletDirective } from './list-item';
/** List panel services */
import { ListPanelService } from './list-panel.service';

const NO_GROUP_ITEMS = 'no_group_items';
const LIST_PANEL_CLASS = 'list-panel-wrapper';
const LIST_HEADER_CLASS = 'list-header-wrapper';
const LIST_ITEM_CLASS = 'list-item-wrapper';
const LIST_NO_GROUP_CLASS = 'list-no-group-wrapper';

@Component({
  selector: 'mcs-list-panel',
  templateUrl: './list-panel.component.html',
  styles: [require('./list-panel.component.scss')],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ListPanelComponent<T> implements OnInit, AfterContentInit,
  AfterContentChecked, OnDestroy {

  @HostBinding('class')
  public class = LIST_PANEL_CLASS;

  /**
   * A search mode flag that triggers when searching from the datasource
   */
  @Input()
  public get searchMode(): boolean {
    return this._searchMode;
  }
  public set searchMode(value: boolean) {
    if (this._searchMode !== value) {
      this._searchMode = value;
      this._changeDetectorRef.markForCheck();
    }
  }
  private _searchMode: boolean;

  /**
   * The selected list item from the datasource
   */
  @Input()
  public get selectedListItem(): McsListPanelItem {
    return this._selectedListItem;
  }
  public set selectedListItem(value: McsListPanelItem) {
    if (this._selectedListItem !== value) {
      this._selectedListItem = value;
      this._listPanelService.selectItem(value);
      this._changeDetectorRef.markForCheck();
    }
  }
  private _selectedListItem: McsListPanelItem;

  /**
   * Trackby function to use wheater the data has been changed
   */
  @Input()
  public set trackBy(fn: TrackByFunction<T>) {
    this._trackBy = fn;
  }
  public get trackBy(): TrackByFunction<T> { return this._trackBy; }
  private _trackBy: TrackByFunction<T>;

  /**
   * An observable datasource to bind inside the table data
   */
  @Input()
  public get dataSource(): McsDataSource<T> {
    return this._dataSource;
  }
  public set dataSource(value: McsDataSource<T>) {
    if (this._dataSource !== value) {
      this._switchDataSource(value);
      this._dataSource = value;
    }
  }
  private _dataSource: McsDataSource<T>;
  private _dataSourceSubscription: any;
  private _data: NgIterable<T>;
  private _dataDiffer: IterableDiffer<T>;
  private _dataMap: Map<string, T[]>;

  /**
   * Get/Set the data obtainment status based on observables
   */
  private _dataStatus: McsDataStatus;
  public get dataStatus(): McsDataStatus {
    return this._dataStatus;
  }
  public set dataStatus(value: McsDataStatus) {
    if (this._dataStatus !== value) {
      this._dataStatus = value;
    }
  }

  /**
   * Placeholders within the table template where the header and rows data will be inserted
   */
  @ViewChild(ListItemsPlaceholderDirective)
  private _listItemsPlaceholder: ListItemsPlaceholderDirective;

  /** Columns */
  @ContentChild(ListDefDirective)
  private _listDefinition: ListDefDirective;

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _renderer: Renderer2,
    private _elementRef: ElementRef,
    private _differs: IterableDiffers,
    private _listPanelService: ListPanelService
  ) {
    this._data = [];
    this._dataMap = new Map<string, T[]>();
  }

  public ngOnInit() {
    this._dataDiffer = this._differs.find([]).create(this._trackBy);
  }

  public ngAfterContentInit() {
    // Render item groups
    if (this.dataSource && !this._dataSourceSubscription) {
      this._getDatasource();
    }
  }

  public ngAfterContentChecked() {
    if (!isNullOrEmpty(this._data)) {
      this._renderItemGroups();
    }
  }

  public ngOnDestroy() {
    if (this._dataSourceSubscription) {
      this._dataSourceSubscription.unsubscribe();
      this.dataSource.disconnect();
    }
  }

  /**
   * This will remove the subscription of the previous datasource
   * including the data-row view to refresh all the data from scratch
   * @param newDatasource New Datasource obtained
   */
  private _switchDataSource(newDatasource: McsDataSource<T>) {
    if (isNullOrEmpty(newDatasource) || isNullOrEmpty(this.dataSource)) { return; }

    this._data = [];
    if (newDatasource) {
      this.dataSource.disconnect();
    }
    if (this._dataSourceSubscription) {
      this._dataSourceSubscription.unsubscribe();
      this._dataSourceSubscription = null;
    }

    if (!newDatasource) {
      this._listItemsPlaceholder.viewContainer.clear();
    }
  }

  /**
   * This will render the header rows including each header cells
   */
  private _renderItemGroups(): void {
    let changes = this._dataDiffer.diff(this._data);
    if (!changes) { return; }

    this._listItemsPlaceholder.viewContainer.clear();
    this._dataMap.forEach((values: T[], key: string) => {
      if (key === NO_GROUP_ITEMS) {
        this._insertListNoGroupItems(values);
      } else {
        this._insertListHeader(key);
        this._insertListItems(values);
      }
    });
    this._changeDetectorRef.markForCheck();

    refreshView(() => {
      this._reselectListItem();
    });
  }

  /**
   * Insert the list header items in the header definition placeholder in sequence
   * @param headerName Header name to be inserted
   */
  private _insertListHeader(headerName: string): void {
    if (isNullOrEmpty(headerName)) { return; }

    let itemGroupDef = this._listDefinition.listHeaderDefinition;
    let view = this._listItemsPlaceholder.viewContainer
      .createEmbeddedView(itemGroupDef.template, { $implicit: headerName });

    // Add class
    if (!isNullOrEmpty(view)) {
      this._renderer.addClass(view.rootNodes[0], LIST_HEADER_CLASS);
    }
  }

  /**
   * Insert the list of items in the most recent outlet of the view
   * based on the list item definition placeholder
   * @param items Items to be inserted
   */
  private _insertListItems(items: T[]): void {
    if (isNullOrEmpty(items)) { return; }

    // Insert all items from the inputted value and create the template
    // on the most recent outlet of the view (mcs-list-item)
    let itemDef = this._listDefinition.listItemDefinition;
    items.forEach((context) => {
      let view = ListItemOutletDirective.mostRecentOutlet.viewContainer
        .createEmbeddedView(itemDef.template, { $implicit: context });

      // Add class
      if (!isNullOrEmpty(view)) {
        this._renderer.addClass(view.rootNodes[0], LIST_ITEM_CLASS);
      }
    });
  }

  /**
   * Insert the list of no group items in the header placeholder to serve as
   * main item instead of header
   * @param items Items to be inserted
   */
  private _insertListNoGroupItems(items: T[]): void {
    if (isNullOrEmpty(items)) { return; }

    let noGroupDef = this._listDefinition.listItemDefinition;
    items.forEach((context) => {
      let view = this._listItemsPlaceholder.viewContainer
        .createEmbeddedView(noGroupDef.template, { $implicit: context });

      // Add class
      if (!isNullOrEmpty(view)) {
        this._renderer.addClass(view.rootNodes[0], LIST_NO_GROUP_CLASS);
      }
    });
  }

  /**
   * This will reselect the list item to cover up the filtering of
   * element based on the datasource
   */
  private _reselectListItem(): void {
    if (!this.searchMode) {
      this._listPanelService.selectItem(this._listPanelService.selectedItem);
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Get the datasource from the given data
   *
   * `@Note` This will run asynchronously
   */
  private _getDatasource(): void {
    this._dataSourceSubscription = this.dataSource.connect()
      .catch((error) => {
        this.dataStatus = McsDataStatus.Error;
        this._dataSource.onCompletion(this.dataStatus, undefined);
        return Observable.throw(error);
      })
      .subscribe((data) => {
        this._data = data;
        this._dataMap = this._createListItemsMap(data);
        this._renderItemGroups();

        this.dataStatus = isNullOrEmpty(data) ?
          McsDataStatus.Empty :
          McsDataStatus.Success;
        this._dataSource.onCompletion(this.dataStatus, data);
      });
  }

  /**
   * This will create the list according to property name inputted in the header
   *
   * `@Note:` All unknown/undefined items are included as the last record in the map
   * @param items Items to finalize the data source
   */
  private _createListItemsMap(items: T[]): Map<string, T[]> {
    if (isNullOrEmpty(this._listDefinition)) { return; }
    let propertyName = this._listDefinition.listHeaderDefinition.propertyName;
    let temporaryMapList = new Map<string, T[]>();
    let undefinedItems = new Array();

    items.forEach((item) => {
      // Always get the first index since we only use 1 filter object
      let itemKey = item[propertyName];
      let itemList = new Array();

      // Check for undefined items and add to saved list
      // to give way of the other items to prioritize
      if (isNullOrEmpty(itemKey)) {
        undefinedItems.push(item);
        return;
      }

      if (temporaryMapList.has(itemKey)) {
        itemList = temporaryMapList.get(itemKey);
      }
      itemList.push(item);
      temporaryMapList.set(itemKey, itemList);
    });

    // Add the undefined items to set them as the last record
    if (!isNullOrEmpty(items)) { temporaryMapList.set(NO_GROUP_ITEMS, undefinedItems); }

    return temporaryMapList;
  }
}
