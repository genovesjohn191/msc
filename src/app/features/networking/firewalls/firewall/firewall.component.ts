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
  Subscription,
  Subject,
  throwError
} from 'rxjs';
import {
  startWith,
  takeUntil,
  catchError
} from 'rxjs/operators';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsSearch,
  McsRoutingTabBase,
  McsErrorHandlerService,
  McsDataStatusFactory
} from '../../../../core';
import {
  isNullOrEmpty,
  refreshView,
  unsubscribeSafely,
  unsubscribeSubject
} from '../../../../utilities';
import { ComponentHandlerDirective } from '../../../../shared';
import { Firewall } from '../models';
import { FirewallService } from './firewall.service';
import { FirewallsListSource } from '../firewalls.listsource';
import { FirewallsRepository } from '../firewalls.repository';

// Add another group type in here if you have addition tab
type tabGroupType = 'overview' | 'policies';

@Component({
  selector: 'mcs-firewall',
  templateUrl: './firewall.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})
export class FirewallComponent
  extends McsRoutingTabBase<tabGroupType>
  implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('search')
  public search: McsSearch;

  @ViewChild(ComponentHandlerDirective)
  public componentHandler: ComponentHandlerDirective;

  public firewallsTextContent: any;
  public firewallTextContent: any;
  public firewallsListSource: FirewallsListSource | null;
  public firewallsMap: Map<string, Firewall[]>;
  public listStatusFactory: McsDataStatusFactory<Map<string, Firewall[]>>;

  // Subscription
  public firewallSubscription: Subscription;

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public get cogIconKey(): string {
    return CoreDefinition.ASSETS_SVG_COG;
  }

  public get hasFirewallData(): boolean {
    return !isNullOrEmpty(this.selectedFirewall);
  }

  /**
   * Selected Firewall based on the selected in the listing panel
   */
  private _selectedFirewall: Firewall;
  public get selectedFirewall(): Firewall { return this._selectedFirewall; }
  public set selectedFirewall(value: Firewall) {
    if (this._selectedFirewall !== value) {
      this._selectedFirewall = value;
      this._changeDetectorRef.markForCheck();
    }
  }
  private _destroySubject = new Subject<void>();

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
    this.selectedFirewall = new Firewall();
    this.firewallsMap = new Map();
    this.listStatusFactory = new McsDataStatusFactory();
  }

  public ngOnInit() {
    this.firewallsTextContent = this._textContentProvider.content.firewalls;
    this.firewallTextContent = this._textContentProvider.content.firewalls.firewall;
    super.onInit();
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this.search.searchChangedStream
        .pipe(startWith(null), takeUntil(this._destroySubject))
        .subscribe(() => this.listStatusFactory.setInProgress());

      this._firewallsRepository.dataRecordsChanged
        .pipe(takeUntil(this._destroySubject))
        .subscribe(() => this._changeDetectorRef.markForCheck());
      this._initializeListsource();
    });
  }

  public ngOnDestroy() {
    super.onDestroy();
    unsubscribeSubject(this._destroySubject);
    unsubscribeSafely(this.firewallSubscription);
  }

  /**
   * Navigate on the selected firewall overview page and
   * set the selected firewall to update selectedFirewallStream
   * @param firewall Selected firewall instance
   */
  public onFirewallSelect(firewall: Firewall): void {
    if (isNullOrEmpty(firewall)) { return; }

    this._setSelectedFirewallById(firewall.id);
    this._changeDetectorRef.markForCheck();
    this.router.navigate(['/networking/firewalls', firewall.id]);
  }

  /**
   * Returns the firewall group name based on its ipaddress
   * @param ipAddress Ip address that served as the basis
   */
  public getFirewallGroupName(ipAddress: string): string {
    let firewallGroup = this.firewallsMap && this.firewallsMap.get(ipAddress);
    if (isNullOrEmpty(firewallGroup)) { return ''; }

    let masterFirewall = firewallGroup.find((firewall) => firewall.haRole === 'Master');
    return isNullOrEmpty(masterFirewall) ? '' : masterFirewall.managementName;
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
    if (isNullOrEmpty(id)) { return; }

    // We need to recreate the component in order for the
    // component to generate new instance
    if (!isNullOrEmpty(this.componentHandler)) {
      this.componentHandler.recreateComponent();
    }
    this._getFirewallById(id);
    this._setSelectedFirewallById(id);
  }

  /**
   * Initialize list source
   */
  private _initializeListsource(): void {
    this.firewallsListSource = new FirewallsListSource(
      this._firewallsRepository,
      this.search
    );

    // Key function pointer for mapping objects
    let keyFn = (item: Firewall) => {
      let resourseName = isNullOrEmpty(item.managementIpAddress) ? '' :
        item.managementIpAddress;
      return resourseName;
    };

    // Listen to all records changed
    this.firewallsListSource.findAllRecordsMapStream(keyFn)
      .pipe(
        catchError((error) => {
          this.listStatusFactory.setError();
          return throwError(error);
        })
      )
      .subscribe((response) => {
        this.firewallsMap = response;
        this.search.showLoading(false);
        this.listStatusFactory.setSuccessful(response);
      });
    this._changeDetectorRef.markForCheck();
  }

  /**
   * This will set the active firewall when data was obtained from repository
   * @param firewallId Firewall identification
   */
  private _getFirewallById(firewallId: string): void {
    this.firewallSubscription = this._firewallsRepository
      .findRecordById(firewallId)
      .pipe(
        catchError((error) => {
          // Handle common error status code
          this._errorHandlerService.handleHttpRedirectionError(error.status);
          return throwError(error);
        })
      )
      .subscribe((response) => {
        this._setSelectedFirewallById(response.id);
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * This will set the selected firewall details for every selection
   */
  private _setSelectedFirewallById(firewallId: string): void {
    if (isNullOrEmpty(firewallId)) { return; }
    // Set the selection of firewall based on its ID
    let firewallFound = this._firewallsRepository.dataRecords
      .find((firewall) => firewall.id === firewallId);
    if (isNullOrEmpty(firewallFound)) {
      this.selectedFirewall = { id: firewallId } as Firewall;
      return;
    }

    this.selectedFirewall = firewallFound;
    this._firewallService.setSelectedFirewall(this.selectedFirewall);
  }
}
