import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  AfterContentChecked,
  ViewChild,
  ContentChild,
  ChangeDetectorRef,
  Renderer2,
  NgIterable,
  IterableDiffer,
  IterableDiffers,
  TrackByFunction,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  HostBinding
} from '@angular/core';
import { Observable } from 'rxjs/Rx';
/** Core / Utilities */
import {
  CoreDefinition,
  McsDataSource,
  McsDataStatus,
  McsListPanelItem
} from '../../core';
import {
  isNullOrEmpty,
  refreshView
} from '../../utilities';
/** List panel directives */
import {
  ListItemsPlaceholderDirective,
  ListItemsStatusPlaceholderDirective
} from './shared';
import { ListDefDirective } from './list-definition';
import { ListItemOutletDirective } from './list-item';
/** List panel services */
import { ListPanelService } from './list-panel.service';
/** List items status */
import { ListItemsStatusDefDirective } from './list-items-status';

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

export class ListPanelComponent<T> implements OnInit,
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
  public get listSource(): McsDataSource<T> {
    return this._listSource;
  }
  public set listSource(value: McsDataSource<T>) {
    if (this._listSource !== value) {
      this._switchListSource(value);
      this._listSource = value;
      this._changeDetectorRef.markForCheck();
    }
  }
  private _listSource: McsDataSource<T>;
  private _listSourceSubscription: any;
  private _listItems: NgIterable<T>;
  private _listDiffer: IterableDiffer<T>;
  private _listMap: Map<string, T[]>;

  /**
   * Get/Set the data obtainment status based on observables
   */
  private _listStatus: McsDataStatus;
  public get listStatus(): McsDataStatus {
    return this._listStatus;
  }
  public set listStatus(value: McsDataStatus) {
    if (this._listStatus !== value) {
      this._listStatus = value;
      this._switchListStatus(value);
    }
  }

  /**
   * Placeholders within the table template where the header and rows data will be inserted
   */
  @ViewChild(ListItemsPlaceholderDirective)
  private _listItemsPlaceholder: ListItemsPlaceholderDirective;

  @ViewChild(ListItemsStatusPlaceholderDirective)
  private _listItemsStatusPlaceholder: ListItemsStatusPlaceholderDirective;

  /** Columns */
  @ContentChild(ListDefDirective)
  private _listDefinition: ListDefDirective;

  @ContentChild(ListItemsStatusDefDirective)
  private _listItemsStatusDefinition: ListItemsStatusDefDirective;

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public get dataStatusEnum(): any {
    return McsDataStatus;
  }

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _renderer: Renderer2,
    private _differs: IterableDiffers,
    private _listPanelService: ListPanelService
  ) {
    this._listItems = [];
    this._listMap = new Map<string, T[]>();

    // Add loader while table is initializing
    this.listStatus = McsDataStatus.InProgress;
  }

  public ngOnInit() {
    this._listDiffer = this._differs.find([]).create(this._trackBy);
  }

  public ngAfterContentChecked() {
    if (!isNullOrEmpty(this._listItems)) {
      this._renderItemGroups();
    }

    if (this.listSource && !this._listSourceSubscription) {
      this._getListsource();
    }
  }

  public ngOnDestroy() {
    if (this._listSourceSubscription) {
      this._listSourceSubscription.unsubscribe();
      this.listSource.disconnect();
    }
  }

  /**
   * This will remove the subscription of the previous datasource
   * including the data-row view to refresh all the data from scratch
   * @param newListsource New Datasource obtained
   */
  private _switchListSource(newListsource: McsDataSource<T>) {
    if (isNullOrEmpty(newListsource) || isNullOrEmpty(this.listSource)) { return; }

    this._listItems = [];
    if (newListsource) {
      this.listSource.disconnect();
    }
    if (this._listSourceSubscription) {
      this._listSourceSubscription.unsubscribe();
      this._listSourceSubscription = null;
    }

    if (!newListsource) {
      this._listItemsPlaceholder.viewContainer.clear();
    }
  }

  /**
   * Switch the data status based on the new data status
   * `@Note:` This will remove the previous status in the DOM
   * @param newListStatus New datastatus to be set
   */
  private _switchListStatus(newListStatus: McsDataStatus) {
    if (isNullOrEmpty(this._listItemsStatusDefinition)) { return; }
    this._listItemsStatusPlaceholder.viewContainer.clear();

    switch (newListStatus) {
      case McsDataStatus.Empty:
        if (isNullOrEmpty(this._listItemsStatusDefinition.listItemsEmptyDef)) { break; }
        this._listItemsStatusPlaceholder.viewContainer
          .createEmbeddedView(this._listItemsStatusDefinition.listItemsEmptyDef.template);
        break;

      case McsDataStatus.Error:
        if (isNullOrEmpty(this._listItemsStatusDefinition.listItemsErrorDef)) { break; }
        this._listItemsStatusPlaceholder.viewContainer
          .createEmbeddedView(this._listItemsStatusDefinition.listItemsErrorDef.template);
      default:
        break;
    }
  }

  /**
   * This will render the header rows including each header cells
   */
  private _renderItemGroups(): void {
    let changes = this._listDiffer.diff(this._listItems);
    if (!changes) { return; }

    this._listItemsPlaceholder.viewContainer.clear();
    this._listMap.forEach((values: T[], key: string) => {
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
  private _getListsource(): void {
    this._listSourceSubscription = this.listSource.connect()
      .catch((error) => {
        this.listStatus = McsDataStatus.Error;
        this._listSource.onCompletion(this.listStatus, undefined);
        return Observable.throw(error);
      })
      .subscribe((data) => {
        this._listItems = data;
        this._listMap = this._createListItemsMap(data);
        this._renderItemGroups();

        this.listStatus = isNullOrEmpty(data) ?
          McsDataStatus.Empty :
          McsDataStatus.Success;
        this._listSource.onCompletion(this.listStatus, data);
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
