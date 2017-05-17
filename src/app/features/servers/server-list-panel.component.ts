import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  ViewChild,
  Renderer2,
  ElementRef,
  HostListener
} from '@angular/core';
import { Server } from './server';
import { ActivatedRoute } from '@angular/router';
import {
  McsAssetsProvider,
  CoreDefinition,
  getElementOffset
} from '../../core';
import { ServerList } from './server-list';

@Component({
  selector: 'mcs-server-list-panel',
  styles: [require('./server-list-panel.component.scss')],
  templateUrl: './server-list-panel.component.html'
})
export class ServerListPanelComponent implements OnInit, AfterViewInit {
  public servers: ServerList[];
  public serverList: ServerList[];
  public selectedServerId: number;
  public caretDown: string;
  public serverState: string;
  public keyword: string;

  @Input()
  public serverListData: Server[];

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

  constructor(
      private _route: ActivatedRoute,
      private _assetsProvider: McsAssetsProvider,
      private _renderer: Renderer2
    ) {
      this.servers = new Array();
      this.serverList = new Array();
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
    this.caretDown = this._assetsProvider.getIcon('caret-down');
    this.serverState = this._assetsProvider.getIcon('server-state');
    this._route.params.subscribe((params) => {
      this.selectedServerId = Number(params['id']);
      this.mapServerList(this.serverListData);
    });
  }

  public mapServerList(serverListData: Server[]): void {
    serverListData.forEach((server) => {
      let isExist: boolean = false;

      if (server.id === this.selectedServerId) {
        server.selected = true;
      }

      for (let serverIndex in this.serverList) {
        if (this.serverList[serverIndex].vdcName.localeCompare(server.serviceDescription) === 0) {
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
        serverList.vdcName = server.serviceDescription;
        serverList.servers = serverValues;
        if (server.id === this.selectedServerId) {
          serverList.selected = true;
        }

        this.serverList.push(serverList);
      }
    });

    this.servers = this.serverList.slice();
  }

  public ngAfterViewInit() {
    setTimeout(() => {
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
          return server.managementName.toLowerCase().includes(key.toLowerCase()) ||
            server.powerState === this.getServerState(key.toLowerCase());
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

  public getServerState(keyword: string): number {
    let state: number;
    switch (keyword) {
      case CoreDefinition.SERVER_STATE_STOPPED: {
        state = 0;
        break;
      }

      case CoreDefinition.SERVER_STATE_RUNNING: {
        state = 1;
        break;
      }

      case CoreDefinition.SERVER_STATE_RESTARTING: {
        state = 2;
        break;
      }
    }
    return state;
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

}
