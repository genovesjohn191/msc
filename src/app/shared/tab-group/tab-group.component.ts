import {
  Component,
  Input,
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

  @Input()
  public selectedTabIndex: number;

  @ContentChildren(TabComponent)
  public tabs: QueryList<TabComponent>;

  /** Selection model to determine which tab is selected */
  private _selectionModel: McsSelection<TabComponent>;

  constructor(private _changeDetectorRef: ChangeDetectorRef) {
    this.selectedTabIndex = 0;
    this._selectionModel = new McsSelection<TabComponent>(false);
  }

  public ngAfterContentInit(): void {
    // Select the first tab in case the selectedtabindex is not provided
    refreshView(() => {
      if (!isNullOrEmpty(this.tabs)) {
        this.selectTab(this.tabs.toArray()[this.selectedTabIndex]);
      }
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
    if (isNullOrEmpty(tab) || !tab.supportSelection) { return; }
    this._selectionModel.select(tab);
    this._changeDetectorRef.markForCheck();
  }
}
