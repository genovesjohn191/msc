import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChildren,
  QueryList,
  AfterContentInit,
  ChangeDetectorRef,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import { McsSelection } from '../../core';
import {
  isNullOrEmpty,
  refreshView
} from '../../utilities';
import { TabComponent } from './tab/tab.component';

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

export class TabGroupComponent implements AfterContentInit {

  @ContentChildren(TabComponent)
  public tabs: QueryList<TabComponent>;

  @Output()
  public tabChanged: EventEmitter<any>;

  @Input()
  public get selectedTabId(): any {
    return this._selectedTabId;
  }
  public set selectedTabId(value: any) {
    if (this._selectedTabId !== value) {
      this._selectedTabId = value;
      refreshView(() => {
        this._setActiveTab(value);
      });
    }
  }
  private _selectedTabId: any;

  /** Selection model to determine which tab is selected */
  private _selectionModel: McsSelection<TabComponent>;

  constructor(private _changeDetectorRef: ChangeDetectorRef) {
    this.tabChanged = new EventEmitter();
    this._selectionModel = new McsSelection<TabComponent>(false);
  }

  public ngAfterContentInit(): void {
    refreshView(() => {
      this._setActiveTab(undefined);
    });
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
    this._changeDetectorRef.markForCheck();
    this.tabChanged.emit(tab);
  }

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
