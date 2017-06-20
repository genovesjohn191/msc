import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import {
  Observable,
  Subject
} from 'rxjs/Rx';
import { Router } from '@angular/router';
/** Services */
import {
  McsTextContentProvider,
  McsAssetsProvider,
  McsApiSearchKey,
  McsApiJob
} from '../../core';
import { ServersService } from './servers.service';
/** Models */
import {
  Server,
  ServerPowerState
} from './models';
import {
  McsApiError,
  McsApiSuccessResponse,
  McsApiErrorResponse,
  McsNotificationContextService,
  CoreDefinition
} from '../../core';
import {
  mergeArrays,
  refreshView,
  updateArrayRecord
} from '../../utilities';

@Component({
  selector: 'mcs-servers',
  templateUrl: './servers.component.html',
  styles: [require('./servers.component.scss')]
})

export class ServersComponent implements OnInit, OnDestroy {
  public serversTextContent: string;
  public page: number;
  public keyword: string;
  public isLoading: boolean;
  public gear: string;
  /** Server Variables */
  public totalServerCount: number;
  public servers: Server[];
  /** Filter Variables */
  public columnSettings: any;
  /** Search Subscription */
  public searchSubscription: any;
  public searchSubject: Subject<McsApiSearchKey>;

  public actionStatusMap: Map<any, string>;
  public notificationsSubscription: any;

  public hasError: boolean;
  // Done loading and thrown an error
  public get loadedSuccessfully(): boolean {
    return !this.hasError;
  }

  // Done loading and no servers to display
  public get noServers(): boolean {
    return this.totalServerCount === 0 && !this.hasError && !this.keyword && !this.isLoading;
  }

  // Done loading and no servers found on filter
  public get emptySearchResult(): boolean {
    return this.totalServerCount === 0 && this.keyword && !this.isLoading;
  }

  public constructor(
    private _textProvider: McsTextContentProvider,
    private _serversService: ServersService,
    private _assetsProvider: McsAssetsProvider,
    private _router: Router,
    private _notificationContextService: McsNotificationContextService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.isLoading = true;
    this.hasError = false;
    this.page = 1;
    this.searchSubject = new Subject<McsApiSearchKey>();
    this.servers = new Array();
    this.totalServerCount = 0;
    this.actionStatusMap = new Map<any, string>();
  }

  public ngOnInit() {
    this.serversTextContent = this._textProvider.content.servers;
    this.getGearClass();
    this.getServers();
    this._listenToNotificationUpdate();
  }

  public ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }

    if (this.notificationsSubscription) {
      this.notificationsSubscription.unsubscribe();
    }
  }

  public executeServerCommand(server: Server, action: string) {
    this._serversService.postServerCommand(
      server.id,
      action,
      {
        serverId: server.id,
        powerState: server.powerState,
        actionState: action
      }
    )
      .subscribe((response) => {
        // console.log(response);
      });

    this.actionStatusMap.set(server.id, action);
  }

  public getActionStatus(id: any, type: string): any {
    let status: any = null;
    let isExist = this.actionStatusMap.has(id);

    if (isExist) {
      let currentAction = this.actionStatusMap.get(id);
      if (currentAction === type) {
        status = currentAction;
      }
    }
    return status;
  }

  public getGearClass() {
    this.gear = this._assetsProvider.getIcon('gear');
  }

  public getSpinnerClass(): string {
    return this._assetsProvider.getIcon('spinner');
  }

  public getStateIconKey(state: number): string {
    let stateIconKey: string = '';

    switch (state as ServerPowerState) {
      case ServerPowerState.Unresolved:   // Red
      case ServerPowerState.Deployed:
      case ServerPowerState.Suspended:
      case ServerPowerState.Unknown:
      case ServerPowerState.Unrecognised:
      case ServerPowerState.PoweredOff:
        stateIconKey = CoreDefinition.ASSETS_SVG_STATE_STOPPED;
        break;

      case ServerPowerState.Resolved:   // Amber
      case ServerPowerState.WaitingForInput:
      case ServerPowerState.InconsistentState:
      case ServerPowerState.Mixed:
        stateIconKey = CoreDefinition.ASSETS_SVG_STATE_RESTARTING;
        break;

      case ServerPowerState.PoweredOn:  // Green
      default:
        stateIconKey = CoreDefinition.ASSETS_SVG_STATE_RUNNING;
        break;
    }
    return stateIconKey;
  }

  public getServers(): void {
    this.isLoading = true;
    this.searchSubscription = Observable.of(new McsApiSearchKey())
      .concat(this.searchSubject)
      .debounceTime(CoreDefinition.SEARCH_TIME)
      .distinctUntilChanged((previous, next) => {
        return previous.isEqual(next);
      })
      .switchMap((searchKey) => {
        // Switch observable items to server list
        return this._serversService.getServers(
          searchKey.page,
          searchKey.maxItemPerPage ?
            searchKey.maxItemPerPage : CoreDefinition.SERVER_LIST_MAX_ITEM_PER_PAGE,
          searchKey.keyword
        ).finally(() => this.isLoading = false);
      })
      .catch((error: McsApiErrorResponse) => {
        this.hasError = true;
        return Observable.throw(error);
      })
      .subscribe((mcsApiResponse) => {
        // Get server response
        if (this.page === 1) { this.servers.splice(0); }
        if (mcsApiResponse.content) {
          this.hasError = false;
          this.servers = mergeArrays(this.servers, mcsApiResponse.content);
          this.totalServerCount = mcsApiResponse.totalCount;
        }
      });
  }

  public onClickMoreEvent(): void {
    this.getNextPage();
  }

  public onSearchEvent(key: any): void {
    this.searchServers(key);
  }

  public onEnterSearchEvent(): void {
    this.searchServers(this.keyword);
  }

  public getNextPage(): void {
    this.page += 1;
    this.updateServers(this.keyword, this.page);
  }

  public getDisplayServerCount(): number {
    return this.page * CoreDefinition.SERVER_LIST_MAX_ITEM_PER_PAGE;
  }

  public searchServers(key: any): void {
    this.page = 1;
    this.keyword = key;
    this.updateServers(this.keyword, this.page);
  }

  public updateServers(key?: string, page?: number) {
    let searchKey: McsApiSearchKey = new McsApiSearchKey();
    // Set server search key
    searchKey.maxItemPerPage = CoreDefinition.SERVER_LIST_MAX_ITEM_PER_PAGE;
    searchKey.page = page;
    searchKey.keyword = key;
    // Set true to loading flag
    this.isLoading = true;
    this.searchSubject.next(searchKey);
  }

  public onUpdateColumnSettings(columns: any): void {
    if (columns) {
      this.columnSettings = columns;
    }
  }

  public onClickNewServerButton(event: any) {
    this._router.navigate(['./servers/create/new']);
  }

  private _listenToNotificationUpdate(): void {
    // listener for the notification updates
    this.notificationsSubscription = this._notificationContextService.notificationsStream
      .subscribe((updatedNotifications) => {

        updatedNotifications.forEach((notification) => {
          // Filter only those who have client reference object only
          if (notification.clientReferenceObject) {
            refreshView(() => {
              this._changeServerStatus(notification);
              this._changeDetectorRef.detectChanges();
            }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
          }
        });

      });
  }

  private _changeServerStatus(notification: McsApiJob) {
    // TODO: get the serverid and obtain again the server information from the API
    // to get the actual result (realtime)

    // Get the server from the API
    let updatedServer: Server;
    // TODO: This must be API call
    updatedServer = this.servers.find((server) => {
      return server.id === notification.clientReferenceObject.serverId;
    });
    if (!updatedServer) { return; }
    // Ignore power status in case of error
    switch (notification.status) {
      case CoreDefinition.NOTIFICATION_JOB_COMPLETED:
        updatedServer.powerState = notification.clientReferenceObject.actionState === 'Start' ?
          ServerPowerState.PoweredOn : ServerPowerState.PoweredOff;
        break;
      case CoreDefinition.NOTIFICATION_JOB_FAILED:
        updatedServer.powerState = notification.clientReferenceObject.powerState;
        break;
      case CoreDefinition.NOTIFICATION_JOB_ACTIVE:
      default:
        updatedServer.powerState = undefined;
        break;
    }

    // Update the server record according to API record
    updateArrayRecord(
      this.servers,
      updatedServer,
      (_first, _second) => {
        return _first.id === _second.id;
      }
    );
  }
}
