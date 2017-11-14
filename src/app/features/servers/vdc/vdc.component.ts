import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import { Subscription } from 'rxjs/Rx';
import {
  Server,
  ServerPowerState,
  ServerCommand,
  ServerResource
} from '../models';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsListPanelItem,
  McsSearch,
  McsRoutingTabBase
} from '../../../core';
import {
  isNullOrEmpty,
  refreshView
} from '../../../utilities';
import { ServersService } from '../servers.service';
import { ServersListSource } from '../servers.listsource';
import { VdcService } from './vdc.service';

// Add another group type in here if you have addition tab
type tabGroupType = 'overview';

@Component({
  selector: 'mcs-vdc',
  templateUrl: './vdc.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VdcComponent
  extends McsRoutingTabBase<tabGroupType>
  implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('search')
  public search: McsSearch;

  public vdcSubscription: Subscription;
  public textContent: any;
  public serverTextContent: any;
  public serverListSource: ServersListSource | null;

  private _resourceId: any;

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  private _vdc: ServerResource;
  public get vdc(): ServerResource {
    return this._vdc;
  }
  public set vdc(value: ServerResource) {
    this._vdc = value;
    this._changeDetectorRef.markForCheck();
  }

  private _selectedItem: McsListPanelItem;
  public get selectedItem(): McsListPanelItem {
    return this._selectedItem;
  }
  public set selectedItem(value: McsListPanelItem) {
    this._selectedItem = value;
  }

  constructor(
    _router: Router,
    _activatedRoute: ActivatedRoute,
    private _textContentProvider: McsTextContentProvider,
    private _changeDetectorRef: ChangeDetectorRef,
    private _serversService: ServersService,
    private _vdcService: VdcService
  ) {
    super(_router, _activatedRoute);
    this.vdc = new ServerResource();
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.servers;
    this._resourceId = this.activatedRoute.snapshot.paramMap.get('id');
    this._getVdcById();
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this._initializeListsource();
    });
  }

  public ngOnDestroy() {
    super.dispose();
    if (!isNullOrEmpty(this.vdcSubscription)) {
      this.vdcSubscription.unsubscribe();
    }
  }

  public onServerSelect(serverId: any) {
    if (isNullOrEmpty(serverId)) { return; }

    this.router.navigate(['/servers', serverId]);
  }

  /**
   * Event that emits when the tab is changed in the routing tabgroup
   * @param tab Active tab
   */
  public onTabChanged(tab: any) {
    if (isNullOrEmpty(this.vdc) || isNullOrEmpty(this.vdc.id)) { return; }
    // Navigate route based on current active tab
    if (tab.id === 'overview') {
      this.router.navigate([`servers/vdc/${this.vdc.id}/overview`]);
    } else {
      // Add navigation of other tab here
    }
  }

  public getActionStatus(server: Server): any {
    if (!server) { return undefined; }
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

  public getActiveServerTooltip(serverId: any) {
    return this._serversService.getActiveServerInformation(serverId);
  }

  /**
   * Retry to obtain the source from API
   */
  public retryListsource(): void {
    if (isNullOrEmpty(this.serverListSource)) { return; }
    this._initializeListsource();
  }

  private _initializeListsource(): void {
    this.serverListSource = new ServersListSource(
      this._serversService,
      this.search
    );
    this._changeDetectorRef.markForCheck();
  }

  private _getVdcById(): void {
    this.vdcSubscription = this._vdcService.getResources().subscribe((response) => {
      if (!isNullOrEmpty(response) && !isNullOrEmpty(response.content)) {
        let resources = response.content as ServerResource[];
        this.vdc = resources.find((resource) => {
          return resource.id === this._resourceId;
        });

        this.selectedItem = {
          itemId: '',
          groupName: this.vdc.name
        } as McsListPanelItem;

        this._vdcService.setSelectedVdc(this.vdc);
      }
    });
  }
}
