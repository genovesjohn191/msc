import {
  Component,
  OnInit,
  OnDestroy
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
  ServerClientObject,
  ServerPowerState,
  ServerCommand
} from './models';
import {
  McsApiError,
  McsApiSuccessResponse,
  McsApiErrorResponse,
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
  public activeServers: ServerClientObject[];
  /** Filter Variables */
  public columnSettings: any;
  /** Search Subscription */
  public searchSubscription: any;
  public searchSubject: Subject<McsApiSearchKey>;

  public activeServersSubscription: any;

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
    private _router: Router
  ) {
    this.isLoading = true;
    this.hasError = false;
    this.page = 1;
    this.searchSubject = new Subject<McsApiSearchKey>();
    this.servers = new Array();
    this.activeServers = new Array();
    this.totalServerCount = 0;
  }

  public ngOnInit() {
    this.serversTextContent = this._textProvider.content.servers;
    this.getServers();
    this._listenToActiveServers();
  }

  public ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }

    if (this.activeServersSubscription) {
      this.activeServersSubscription.unsubscribe();
    }
  }

  public executeServerCommand(server: Server, action: string) {
    this._serversService.postServerCommand(
      server.id,
      action,
      {
        serverId: server.id,
        powerState: server.powerState,
        commandAction: ServerCommand[action]
      } as ServerClientObject)
      .subscribe((response) => {
        // console.log(response);
      });
  }

  public getActionStatus(server: Server): any {
    let status: ServerCommand;

    switch (server.powerState) {
      case ServerPowerState.PoweredOn:
        status = ServerCommand.Start;
        break;

      case ServerPowerState.PoweredOff:
        status = ServerCommand.Stop;
        break;

      default:
        status = ServerCommand.None;
        break;
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

  public getActiveServerInformation(serverId: any) {
    let commandInformation: string = '';
    let activeServer = this.activeServers.find((severInformations) => {
      return severInformations.serverId === serverId;
    });

    if (activeServer) {
      return activeServer.tooltipInformation;
    } else {
      return 'This instance is being processed';
    }
  }

  private _listenToActiveServers(): void {
    // TODO: No Implemented Unit test yet,
    // Unit test must be added when the functionality is official

    // Listen to active servers and update the corresponding server
    this.activeServersSubscription = this._serversService.activeServersStream
      .subscribe((updatedActiveServers) => {
        this.activeServers = updatedActiveServers;
        updatedActiveServers.forEach((activeServer) => {
          this._updateServerPowerState(activeServer);
        });
      });
  }

  private _updateServerPowerState(activeServer: ServerClientObject) {
    // TODO: get the serverid and obtain again the server information from the API
    // to get the actual result (realtime)

    // Get the server from the API
    let updatedServer: Server;
    // TODO: This must be API call
    updatedServer = this.servers.find((server) => {
      return server.id === activeServer.serverId;
    });
    if (!updatedServer) { return; }
    // Ignore power status in case of error
    switch (activeServer.notificationStatus) {
      case CoreDefinition.NOTIFICATION_JOB_COMPLETED:
        updatedServer.powerState = activeServer.commandAction === ServerCommand.Start ?
          ServerPowerState.PoweredOn : ServerPowerState.PoweredOff;
        break;
      case CoreDefinition.NOTIFICATION_JOB_FAILED:
        updatedServer.powerState = activeServer.powerState;
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
