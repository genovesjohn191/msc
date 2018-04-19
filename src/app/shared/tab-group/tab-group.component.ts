import {
  Component,
  Input,
  Output,
  OnDestroy,
  EventEmitter,
  ContentChildren,
  QueryList,
  AfterContentInit,
  ChangeDetectorRef,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import { startWith } from 'rxjs/operators/startWith';
import { takeUntil } from 'rxjs/operators/takeUntil';
import { McsSelection } from '../../core';
import {
  isNullOrEmpty,
  refreshView
} from '../../utilities';
import { TabComponent } from './tab/tab.component';
import { Subject } from 'rxjs';

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

export class TabGroupComponent implements AfterContentInit, OnDestroy {

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
      refreshView(() => this._setActiveTab(value));
    }
  }
  private _selectedTabId: any;

  /** Selection model to determine which tab is selected */
  private _selectionModel: McsSelection<TabComponent>;
  private _destroySubject = new Subject<void>();

  constructor(private _changeDetectorRef: ChangeDetectorRef) {
    this._selectionModel = new McsSelection<TabComponent>(false);
  }

  public ngAfterContentInit(): void {
    this.tabs.changes.pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(() => this._changeDetectorRef.markForCheck());
    refreshView(() => this._setActiveTab(this.selectedTabId));
  }

  public ngOnDestroy() {
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  /**
   * Return the currently active tab
   */
  public get activeTab(): TabComponent {
    return isNullOrEmpty(this._selectionModel.selected) ?
      undefined : this._selectionModel.selected[0];
  }

  /**
   * Select the tab based on input
   * @param tab Tab to be selected
   */
  public selectTab(tab: TabComponent): void {
    if (isNullOrEmpty(tab) || !tab.canSelect) { return; }
    this._selectionModel.select(tab);

    // Add the changing of selectedTabId to support two way binding [(selectedTabId)]
    this.selectedTabId = tab.id;
    this.tabChanged.emit(tab);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Set the active tab based on the given ID
   * @param selectedId Id to be selected
   */
  private _setActiveTab(selectedId: any): void {
    if (isNullOrEmpty(this.tabs)) { return; }

    if (isNullOrEmpty(selectedId)) {
      this.selectTab(this.tabs.toArray()[0]);
    } else {
      this.tabs.forEach((tab) => {
        if (tab.id === selectedId) {
          this.selectTab(tab);
        }
      });
    }
  }
}
