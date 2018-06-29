import { McsDataSource } from '../../core';
import {
  Observable,
  Subject,
  BehaviorSubject,
  merge
} from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsSearch,
  McsListPanelItem,
  McsDataStatus
} from '../../core';
import { refreshView } from '../../utilities';
import {
  GadgetsDatabase,
  UserData
} from './gadgets.database';

export class GadgetsListSource implements McsDataSource<UserData> {

  public dataLoadingStream: Subject<McsDataStatus>;

  private _filterChange = new BehaviorSubject('');
  get filter(): string { return this._filterChange.value; }
  set filter(filter: string) { this._filterChange.next(filter); }

  private _filterMode: boolean;
  public get filterMode(): boolean {
    return this._filterMode;
  }
  public set filterMode(value: boolean) {
    this._filterMode = value;
  }

  private _selectedElement: McsListPanelItem;
  public get selectedElement(): McsListPanelItem {
    return this._selectedElement;
  }
  public set selectedElement(value: McsListPanelItem) {
    this._selectedElement = value;
  }

  constructor(
    private _exampleDatabase: GadgetsDatabase,
    private _listPanelSearch: McsSearch
  ) {
    this._filterMode = false;
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  public connect(): Observable<UserData[]> {
    const displayDataChanges = [
      this._exampleDatabase.dataChange,
      this._listPanelSearch.searchChangedStream
    ];

    return merge(...displayDataChanges)
      .pipe(
        map(() => {
          let undefinedItems = new Array();
          let actualItems = new Array();
          // Add undefined items
          undefinedItems.push({
            color: undefined,
            name: 'no group 1',
            id: '3',
            progress: 'Data progress'
          } as UserData);

          undefinedItems.push({
            color: undefined,
            name: 'no group 2',
            id: '4',
            progress: 'Data progress 2'
          } as UserData);

          if (this._listPanelSearch.keyword) {
            actualItems = this._exampleDatabase.data.filter((item) => {
              return item.name.toLowerCase()
                .includes(this._listPanelSearch.keyword.toLowerCase());
            });
            this._filterMode = true;
          } else {
            actualItems = this._exampleDatabase.data;
            this._filterMode = false;
          }

          // Temporary set the selected element
          if (!this._selectedElement) {
            refreshView(() => {
              this.selectedElement = {
                itemId: actualItems[0].id,
                groupName: actualItems[0].color
              } as McsListPanelItem;
            });
          }

          return [
            ...undefinedItems,
            ...actualItems
          ];
        })
      );
  }

  public disconnect() {
    // Disconnect all resources
  }

  public onCompletion(_status: McsDataStatus): void {
    // Do all the completion of pagination, filtering, etc... here
  }
}
