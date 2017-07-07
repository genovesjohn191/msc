import {
  Component,
  OnInit,
  Output,
  OnDestroy,
  AfterViewInit,
  Input,
  ViewChild,
  Renderer2,
  ElementRef,
  HostListener,
  EventEmitter
} from '@angular/core';
import {
  Server,
  ServerClientObject,
  ServerPowerState,
  ServerCommand
} from '../../models';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import {
  McsTextContentProvider,
  CoreDefinition,
  McsBrowserService
} from '../../../../core';
import {
  getElementOffset,
  getProperCase,
  refreshView
} from '../../../../utilities';
import { ServersService } from '../../servers.service';
import { ServerList } from './server-list';

@Component({
  selector: 'mcs-server-list-panel',
  styles: [require('./server-list-panel.component.scss')],
  templateUrl: './server-list-panel.component.html'
})
export class ServerListPanelComponent implements OnInit, OnDestroy, AfterViewInit {
  public servers: ServerList[];
  public serverList: ServerList[];
  public caretDown: string;
  public serverState: string;
  public keyword: string;
  public errorMessage: string;
  public activeServers: ServerClientObject[];
  public activeServersSubscription: any;

  @Input()
  public serverListData: Server[];

  @Input()
  public selectedServerId: string;

  @Output()
  public serverSelectChange: EventEmitter<any> = new EventEmitter();

  @ViewChild('serverListPanel')
  public serverListPanel: ElementRef;

  @ViewChild('searchBox')
  public searchBox: ElementRef;

  @ViewChild('serverListTree')
  public serverListTree: ElementRef;

  public footer: HTMLElement;

  private _serverListPanelElement: HTMLElement;
  private _serverListPanelOffset: ClientRect;
  private _searchBoxOffset: ClientRect;
  private _serversListTreeOffset: ClientRect;
  private _footerOffset: ClientRect;

  private _searchBoxHeight: number;
  private _sidebarWidth: number;
  private _sidebarTopOffset: number;
  private _serversListHeight: number;
  private _serversListDynamicHeight: number;

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_FONT_SPINNER;
  }

  public get caretDownIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CARET_DOWN;
  }

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _textProvider: McsTextContentProvider,
    private _renderer: Renderer2,
    private _browserService: McsBrowserService,
    private _serversService: ServersService
  ) {
    this.servers = new Array();
    this.activeServers = new Array();
  }

  @HostListener('document:scroll', ['$event'])
  public onScroll(event) {
    if (!this._searchBoxOffset) {
      return;
    }

    this._getFooterVisibleHeight();

    // Detect if scroll offset is same with searchbox top offset
    if (window.pageYOffset >= this._searchBoxOffset.top) {
      // Make sidebar sticky
      this._renderer.addClass(this._serverListPanelElement, 'sticky');

      this._setServersListMaxHeight(this._searchBoxHeight);

      if (this._serversListDynamicHeight === 0) {
        this._serversListDynamicHeight = getElementOffset(this.serverListTree.nativeElement).height;
      }

      this._serverListPanelOffset = getElementOffset(this._serverListPanelElement);
      this._footerOffset = getElementOffset(this.footer);
      // Detect when scroll offset reached footer
      if (this._serverListPanelOffset.bottom >= this._footerOffset.top) {
        let footerVisibleHeight = this._getFooterVisibleHeight();
        this._setServersListMaxHeight(footerVisibleHeight + this._searchBoxHeight);
      }
    } else {
      this._renderer.removeClass(this._serverListPanelElement, 'sticky');
      this._serversListDynamicHeight = 0;
      this._setServersListMaxHeight(this._serversListTreeOffset.top - window.pageYOffset);
    }
  }

  public getElementOffset() {
    this._serverListPanelOffset = getElementOffset(this._serverListPanelElement);
    this._searchBoxOffset = getElementOffset(this.searchBox.nativeElement);
    this._serversListTreeOffset = getElementOffset(this.serverListTree.nativeElement);
    this._footerOffset = getElementOffset(this.footer);
  }

  public ngOnInit() {
    this.errorMessage = this._textProvider.content.servers.errorMessage;
    this._route.params.subscribe((params) => {
      if (this.serverListData) {
        this.mapServerList(this.serverListData);
        this.onClickServer(this.selectedServerId);
      }
    });
    this._listenToActiveServers();
  }

  public ngOnDestroy() {
    if (this.activeServersSubscription) {
      this.activeServersSubscription.unsubscribe();
    }
  }

  public onClickServer(serverId: string) {
    this._browserService.scrollToTop();
    this.selectedServerId = serverId;
    this.serverSelectChange.next(serverId);
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

  public isServerSelected(id: any): boolean {
    return id === this.selectedServerId;
  }

  public mapServerList(serverListData: Server[]): void {
    this.serverList = new Array();
    serverListData.forEach((server) => {
      let isExist: boolean = false;

      for (let serverIndex in this.serverList) {
        if (this.serverList[serverIndex].vdcName === server.vdcName) {
          this.serverList[serverIndex].servers.push(server);
          if (server.id === this.selectedServerId) {
            this.serverList[serverIndex].selected = true;
          }
          isExist = true;
          break;
        }
      }

      if (!isExist) {
        let serverValues = new Array();
        let serverList: ServerList = new ServerList();

        serverValues.push(server);
        serverList.vdcName = server.vdcName;
        serverList.servers = serverValues;
        if (server.id === this.selectedServerId) {
          serverList.selected = true;
        }

        this.serverList.push(serverList);
      }
    });

    this.servers = this.serverList;
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this._serverListPanelElement = this.serverListPanel.nativeElement;
      this.footer = document.getElementsByTagName('footer')[0];
      this.getElementOffset();
      this._getFooterVisibleHeight();
      // Get serverListPanel without padding and apply as maxWidth to sidebar
      let serverListPanelStyles = window.getComputedStyle(this._serverListPanelElement);
      let paddingLeft = parseFloat(serverListPanelStyles.paddingLeft);
      let paddingRight = parseFloat(serverListPanelStyles.paddingRight);
      let maxWidth = this._serverListPanelOffset.width - (paddingLeft + paddingRight);
      this._renderer.setStyle(this._serverListPanelElement, 'max-width', maxWidth + 'px');
      this._setServersListMaxHeight(this._serversListTreeOffset.top - window.pageYOffset);

      // Get searchbox outer height and apply as offsetHeight of sidebar
      let searchBoxStyles = window.getComputedStyle(this.searchBox.nativeElement);
      let marginBottom = parseFloat(searchBoxStyles.marginBottom);
      this._searchBoxHeight = this._searchBoxOffset.height + marginBottom;
    }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
  }

  public onFilter(key: any): void {
    this.keyword = key;

    if (this.keyword) {
      let filteredResults = [];

      this.serverList.forEach((vdc) => {
        let filteredServers = vdc.servers.filter((server) => {
          let powerStateValue = ServerPowerState[getProperCase(key)];
          return server.managementName.toLowerCase().includes(key.toLowerCase()) ||
            server.powerState === powerStateValue;
        });

        if (filteredServers.length > 0) {
          let filteredVdc = {
            vdcName: vdc.vdcName,
            selected: true,
            servers: filteredServers
          };
          filteredResults.push(filteredVdc);
        } else if (vdc.vdcName.toLowerCase().includes(key.toLowerCase())) {
          filteredResults.push(vdc);
        }
      });

      this.servers = filteredResults;
    } else {
      this.servers = this.serverList;
    }
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

  private _setServersListMaxHeight(offsetHeight: number) {
    this._renderer.setStyle(this.serverListTree.nativeElement,
      'max-height', 'calc(100vh - ' + offsetHeight + 'px)');
  }

  private _getFooterVisibleHeight(): number {
    let scrollTop = window.pageYOffset;
    let scrollBottom = scrollTop + window.innerHeight;
    let visibleTop = this._footerOffset.top < scrollTop ? scrollTop : this._footerOffset.top;
    let visibleBottom = this._footerOffset.bottom > scrollBottom ?
      scrollBottom : this._footerOffset.bottom;
    return (visibleBottom - visibleTop);
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

    for (let serverInfo of this.servers) {
      if (serverInfo.selected === false) { continue; }

      // Get the server from the API
      let updatedServer: Server;
      // TODO: This must be API call
      updatedServer = serverInfo.servers.find((server) => {
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
    }
  }
}
