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
  ViewEncapsulation
} from '@angular/core';
/** Core / Utilities */
import {
  McsDataSource,
  McsListPanelItem
} from '../../core';
import { isNullOrEmpty } from '../../utilities';
/** List panel directives */
import { ListItemsPlaceholderDirective } from './shared';
import { ListDefDirective } from './list-definition';
import { ListItemOutletDirective } from './list-item';
/** List panel services */
import { ListPanelService } from './list-panel.service';

@Component({
  selector: 'mcs-list-panel',
  templateUrl: './list-panel.component.html',
  styles: [require('./list-panel.component.scss')],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ListPanelComponent<T> implements OnInit, AfterContentInit,
  AfterContentChecked, OnDestroy {

  @Input()
  public selectedListItem: McsListPanelItem;

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
    this.selectedListItem = new McsListPanelItem();
  }

  public ngOnInit() {
    this._dataDiffer = this._differs.find([]).create(this._trackBy);
    this._listPanelService.selectedItemChangedStream
      .next({
        itemId: this.selectedListItem.itemId,
        groupName: this.selectedListItem.groupName
      } as McsListPanelItem);
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
      this._insertListHeader(key);
      this._insertListItems(values);
    });
    this._changeDetectorRef.markForCheck();
  }

  private _insertListHeader(headerName: string): void {
    if (isNullOrEmpty(headerName)) { return; }

    // Insert ItemGroup Record including its component
    let itemGroupDef = this._listDefinition.listHeaderDefinition;
    let view = this._listItemsPlaceholder.viewContainer
      .createEmbeddedView(itemGroupDef.template, { $implicit: headerName });
  }

  private _insertListItems(items: T[]): void {
    if (isNullOrEmpty(items)) { return; }

    // Insert all items from the inputted value and create the template
    // on the most recent outlet of the view (mcs-list-item)
    let itemDef = this._listDefinition.listItemDefinition;
    items.forEach((context) => {
      ListItemOutletDirective.mostRecentOutlet.viewContainer
        .createEmbeddedView(itemDef.template, { $implicit: context });
    });
  }

  /**
   * Get the datasource from the given data
   *
   * `@Note` This will run asynchronously
   */
  private _getDatasource(): void {
    this._dataSourceSubscription = this.dataSource.connect()
      .subscribe((data) => {
        this._data = data;
        this._dataMap = this._createListItemsMap(data);
        this._renderItemGroups();
        this._dataSource.onCompletion();
      });
  }

  /**
   * This will create the list according to property name inputted in the header
   * @param items Items to finalize the data source
   */
  private _createListItemsMap(items: T[]): Map<string, T[]> {
    if (isNullOrEmpty(this._listDefinition)) { return; }
    let propertyName = this._listDefinition.listHeaderDefinition.propertyName;
    let temporaryMapList = new Map<string, T[]>();

    items.forEach((item) => {
      // Always get the first index since we only use 1 filter object
      let itemKey = item[propertyName];
      let itemList = new Array();
      if (temporaryMapList.has(itemKey)) {
        itemList = temporaryMapList.get(itemKey);
      }
      itemList.push(item);
      temporaryMapList.set(itemKey, itemList);
    });
    return temporaryMapList;
  }
}
