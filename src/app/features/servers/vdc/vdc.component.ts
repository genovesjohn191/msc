import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  IterableDiffers
} from '@angular/core';
import {
  Router,
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  Observable,
  Subscription
} from 'rxjs/Rx';
import {
  Server,
  ServerPowerState,
  ServerResource,
  ServerCommand
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
  refreshView,
  unsubscribeSafely
} from '../../../utilities';
import { ServersRepository } from '../servers.repository';
import { ServersResourcesRespository } from '../servers-resources.repository';
import { ServersListSource } from '../servers.listsource';
import { VdcService } from './vdc.service';

// Add another group type in here if you have addition tab
type tabGroupType = 'overview';

@Component({
  selector: 'mcs-vdc',
  templateUrl: './vdc.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})
export class VdcComponent
  extends McsRoutingTabBase<tabGroupType>
  implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('search')
  public search: McsSearch;

  public textContent: any;
  public serverTextContent: any;
  public serverListSource: ServersListSource | null;

  // Subscription
  public vdcSubscription: Subscription;
  private _parameterSubscription: Subscription;

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
    private _differs: IterableDiffers,
    private _textContentProvider: McsTextContentProvider,
    private _changeDetectorRef: ChangeDetectorRef,
    private _serversRepository: ServersRepository,
    private _serversResourceRepository: ServersResourcesRespository,
    private _vdcService: VdcService
  ) {
    super(_router, _activatedRoute);
    this.vdc = new ServerResource();
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.servers;
    this._listenToParamChange();
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this._initializeListsource();
    });
  }

  public ngOnDestroy() {
    super.dispose();
    unsubscribeSafely(this.vdcSubscription);
    unsubscribeSafely(this._parameterSubscription);
  }

  public onServerSelect(serverId: string) {
    if (isNullOrEmpty(serverId)) { return; }

    this.router.navigate(['/servers', serverId]);
  }

  /**
   * Return true when the server is currently deleting, otherwise false
   * @param server Server to be deleted
   */
  public serverDeleting(server: Server): boolean {
    return server.commandAction === ServerCommand.Delete && server.isProcessing;
  }

  /**
   * Event that emits when the tab is changed in the routing tabgroup
   * @param tab Active tab
   */
  public onTabChanged(tab: any) {
    if (isNullOrEmpty(this.vdc.id)) { return; }
    // Navigate route based on current active tab
    this.router.navigate([`servers/vdc/${tab.id}/overview`]);
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

  /**
   * Retry to obtain the source from API
   */
  public retryListsource(): void {
    if (isNullOrEmpty(this.serverListSource)) { return; }
    this._initializeListsource();
  }

  private _initializeListsource(): void {
    this.serverListSource = new ServersListSource(
      this._serversRepository,
      this.search,
      this._differs
    );
    this._changeDetectorRef.markForCheck();
  }

  /**
   * This will set the active vdc when data was obtained from repository
   * @param vdcId VDC identification
   */
  private _getVdcById(vdcId: string): void {
    this.vdcSubscription = this._serversResourceRepository
      .findRecordById(vdcId)
      .catch((error) => {
        // Handle common error status code
        // this._errorHandlerService.handleHttpRedirectionError(error.status);
        return Observable.throw(error);
      })
      .subscribe((vdc) => {
        this.vdc = vdc;
        this.selectedItem = {
          itemId: '',
          groupName: vdc.name
        } as McsListPanelItem;
        this._vdcService.setSelectedVdc(this.vdc);
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Listen to every change of the parameter
   */
  private _listenToParamChange(): void {
    this._parameterSubscription = this.activatedRoute.paramMap
      .subscribe((params: ParamMap) => {
        let vdcId = params.get('id');
        this._getVdcById(vdcId);
      });
  }
}
