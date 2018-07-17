import {
  Component,
  Input,
  Output,
  OnDestroy,
  EventEmitter,
  ViewChildren,
  ContentChildren,
  QueryList,
  AfterViewInit,
  AfterContentInit,
  ChangeDetectorRef,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import { Subject } from 'rxjs';
import {
  startWith,
  takeUntil
} from 'rxjs/operators';
import { McsSelection } from '../../core';
import {
  isNullOrEmpty,
  unsubscribeSubject
} from '../../utilities';
import { TabComponent } from './tab/tab.component';
import { TabHeaderItemComponent } from './tab-header-item/tab-header-item.component';

@Component({
  selector: 'mcs-tab-group',
  templateUrl: './tab-group.component.html',
  styleUrls: ['./tab-group.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'tabs-wrapper'
  }
})

export class TabGroupComponent implements AfterViewInit, AfterContentInit, OnDestroy {
  @ContentChildren(TabComponent)
  public tabs: QueryList<TabComponent>;

  @Output()
  public tabChanged = new EventEmitter<any>();

  @Output()
  public selectedTabIdChange = new EventEmitter<any>();

  @Input()
  public get selectedTabId(): any { return this._selectedTabId; }
  public set selectedTabId(value: any) {
    if (this._selectedTabId !== value) {
      this._selectedTabId = value;
      this.selectedTabIdChange.emit(this._selectedTabId);
      this._selectTabById(value);
    }
  }
  private _selectedTabId: any;

  @ViewChildren(TabHeaderItemComponent)
  private _tabHeaders: QueryList<TabHeaderItemComponent>;

  /** Selection model to determine which tab is selected */
  private _selectionModel: McsSelection<TabComponent>;
  private _destroySubject = new Subject<void>();

  constructor(private _changeDetectorRef: ChangeDetectorRef) {
    this._selectionModel = new McsSelection<TabComponent>(false);
  }

  public ngAfterContentInit(): void {
    this.tabs.changes
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(() => this._changeDetectorRef.markForCheck());
  }

  public ngAfterViewInit() {
    this._tabHeaders.changes
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(() => this._initializeSelection());
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Return the currently active tab
   */
  public get activeTab(): TabComponent {
    return isNullOrEmpty(this._selectionModel.selected) ?
      undefined : this._selectionModel.selected[0];
  }

  /**
   * Event that emits when the tab is clicked manually
   * @param tab Clicked tab to be set
   */
  public onClickTab(tab: TabComponent): void {
    this._selectTab(tab);
    this._selectedTabId = tab.id;
    this.selectedTabIdChange.emit(this._selectedTabId);
  }

  /**
   * Selects the tab based on its ID Provided
   * @param tabId Tabid to be selected
   */
  private _selectTabById(tabId: string): void {
    let noTabItems = isNullOrEmpty(this.tabs) || isNullOrEmpty(tabId);
    if (noTabItems) { return; }
    let tabFound = this.tabs.find((tab) => tab.id === tabId);
    this._selectTab(tabFound);
  }

  /**
   * Selects the tab based on the provided tab component
   * @param tab Tab to be selected
   */
  private _selectTab(tab: TabComponent): void {
    if (isNullOrEmpty(tab) || !tab.canSelect) { return; }
    this._selectionModel.select(tab);
    this.tabChanged.emit(tab);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Set the initial selection of the tab component
   */
  private _initializeSelection(): void {
    // Defer setting the value in order to avoid the "Expression
    // has changed after it was checked" errors from Angular.
    Promise.resolve().then(() => {
      if (isNullOrEmpty(this.tabs)) { return; }

      isNullOrEmpty(this._selectedTabId) ?
        this.onClickTab(this.tabs.toArray()[0]) :
        this._selectTabById(this._selectedTabId);
    });
  }
}
