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
import { ServersService } from './servers.service';
/** Models */
import {
  Server,
  ServerClientObject,
  ServerPowerState,
  ServerCommand
} from './models';
/** Core */
import {
  McsApiError,
  McsApiErrorResponse,
  McsTextContentProvider,
  McsApiSearchKey,
  CoreDefinition
} from '../../core';
import { mergeArrays } from '../../utilities';

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

  public get gearIconKey() {
    return CoreDefinition.ASSETS_FONT_GEAR;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_FONT_SPINNER;
  }

  public get arrowDownIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_DOWN;
  }

  public constructor(
    private _textProvider: McsTextContentProvider,
    private _serversService: ServersService,
    private _router: Router
  ) {
    this.isLoading = true;
    this.hasError = false;
    this.page = 1;
    this.searchSubject = new Subject<McsApiSearchKey>();
    this.servers = new Array();
    this.totalServerCount = 0;
  }

  public ngOnInit() {
    this.serversTextContent = this._textProvider.content.servers;
    this.getServers();
  }

  public ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
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

  public getServerPowerState(server: Server): number {
    return this._serversService.getActiveServerPowerState(server);
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
    let activeServer = this._serversService.activeServers
      .find((severInformations) => {
        return severInformations.serverId === serverId;
      });

    if (activeServer) {
      return activeServer.tooltipInformation;
    } else {
      return 'This instance is being processed';
    }
  }
}
