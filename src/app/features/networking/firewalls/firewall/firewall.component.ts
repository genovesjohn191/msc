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
import {
  Observable,
  Subscription
} from 'rxjs/Rx';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsSearch,
  McsListPanelItem,
  McsRoutingTabBase,
  McsErrorHandlerService
} from '../../../../core';
import {
  Firewall,
  FirewallConnectionStatus
} from '../models';
import { FirewallService } from './firewall.service';
import { FirewallListSource } from './firewall.listsource';
import { FirewallsRepository } from '../firewalls.repository';
import {
  isNullOrEmpty,
  refreshView,
  unsubscribeSafely
} from '../../../../utilities';

// Add another group type in here if you have addition tab
type tabGroupType = 'overview' | 'policies';

@Component({
  selector: 'mcs-firewall',
  styleUrls: ['./firewall.component.scss'],
  templateUrl: './firewall.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FirewallComponent
  extends McsRoutingTabBase<tabGroupType>
  implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('listSearch')
  public _listSearch: McsSearch;

  public firewallsTextContent: any;
  public firewallTextContent: any;
  public firewallListSource: FirewallListSource | null;
  public header: string;

  // Subscription
  public subscription: Subscription;

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public get cogIconKey(): string {
    return CoreDefinition.ASSETS_SVG_COG;
  }

  public get hasFirewallData(): boolean {
    return !isNullOrEmpty(this.firewall);
  }

  private _firewall: Firewall;
  public get firewall(): Firewall {
    return this._firewall;
  }
  public set firewall(value: Firewall) {
    if (this._firewall !== value) {
      unsubscribeSafely(this.subscription);

      this._firewall = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  private _selectedItem: McsListPanelItem;
  public get selectedItem(): McsListPanelItem {
    return this._selectedItem;
  }
  public set selectedItem(value: McsListPanelItem) {
    this._selectedItem = value;
    this._changeDetectorRef.markForCheck();
  }

  constructor(
    _router: Router,
    _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _errorHandlerService: McsErrorHandlerService,
    private _firewallService: FirewallService,
    private _firewallsRepository: FirewallsRepository
  ) {
    super(_router, _activatedRoute);
    this.firewall = new Firewall();
  }

  public ngOnInit() {
    this.firewallsTextContent = this._textContentProvider.content.firewalls;
    this.firewallTextContent = this._textContentProvider.content.firewalls.firewall;
    super.onInit();
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this._initializeListsource();
    });
  }

  public ngOnDestroy() {
    super.onDestroy();
    unsubscribeSafely(this.subscription);
  }

  /**
   * Navigate on the selected firewall overview page and
   * set the selected firewall to update selectedFirewallStream
   * @param firewall Selected firewall instance
   */
  public onFirewallSelect(firewall: Firewall): void {
    if (isNullOrEmpty(firewall)) { return; }
    this._setSelectedFirewallInfo(firewall);
    this.router.navigate(['/networking/firewalls', firewall.id]);
  }

  public getConnectionStatusIconKey(status: FirewallConnectionStatus): string {
    return this._firewallService.getFirewallConnectionStatusIconKey(status);
  }

  /**
   * Retry to obtain the source from API
   */
  public retryListsource(): void {
    if (isNullOrEmpty(this.firewallListSource)) { return; }
    this._initializeListsource();
  }

  /**
   * Event that emits when the tab is changed in the routing tabgroup
   * @param tab Active tab
   */
  protected onTabChanged(tab: any) {
    // Navigate route based on current active tab
    this.router.navigate(['networking/firewalls', this.paramId, tab.id]);
  }

  /**
   * Event that emits when the parameter id is changed
   * @param id Id of the parameter
   */
  protected onParamIdChanged(id: string): void {
    this._getFirewallById(id);
  }

  /**
   * Initialize list source
   */
  private _initializeListsource(): void {
    this.firewallListSource = new FirewallListSource(
      this._firewallsRepository,
      this._listSearch
    );
    this._changeDetectorRef.markForCheck();
  }

  /**
   * This will set the active firewall when data was obtained from repository
   * @param firewallId Firewall identification
   */
  private _getFirewallById(firewallId: string): void {
    this.subscription = this._firewallsRepository
      .findRecordById(firewallId)
      .catch((error) => {
        // Handle common error status code
        this._errorHandlerService.handleHttpRedirectionError(error.status);
        return Observable.throw(error);
      })
      .subscribe((firewall) => {
        if (!isNullOrEmpty(firewall)) {
          this.firewall = firewall;
          this._setSelectedFirewallInfo(firewall);
          this._firewallService.setSelectedFirewall(this.firewall);
          this._changeDetectorRef.markForCheck();
        }
      });
  }

  /**
   * This will set the selected firewall details every selection
   */
  private _setSelectedFirewallInfo(selectedFirewall: Firewall): void {
    if (isNullOrEmpty(selectedFirewall)) { return; }

    this.selectedItem = {
      itemId: selectedFirewall.id,
      groupName: selectedFirewall.haGroupName
    } as McsListPanelItem;
    this.header = `${selectedFirewall.managementName} (${selectedFirewall.haRole})`;
  }
}
