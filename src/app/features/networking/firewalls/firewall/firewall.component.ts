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
  Subscription,
  Subject
} from 'rxjs/Rx';
import {
  startWith,
  takeUntil
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
  unsubscribeSafely
} from '../../../../utilities';
import {
  Firewall,
  FirewallConnectionStatus
} from '../models';
import { FirewallService } from './firewall.service';
import { FirewallsListSource } from '../firewalls.listsource';
import { FirewallsRepository } from '../firewalls.repository';

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

  @ViewChild('search')
  public search: McsSearch;

  public firewallsTextContent: any;
  public firewallTextContent: any;
  public firewallsListSource: FirewallsListSource | null;
  public firewallsMap: Map<string, Firewall[]>;
  public listStatusFactory: McsDataStatusFactory<Map<string, Firewall[]>>;

  // Subscription
  public subscription: Subscription;

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public get cogIconKey(): string {
    return CoreDefinition.ASSETS_SVG_COG;
  }

  public get hasFirewallData(): boolean {
    return !isNullOrEmpty(this.selectedFirewall);
  }

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
      this.search.searchChangedStream.pipe(startWith(null), takeUntil(this._destroySubject))
        .subscribe(() => this.listStatusFactory.setInProgress());
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
    this._getFirewallById(id);
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
      let resourseName = isNullOrEmpty(item.haGroupName) ? '' : item.haGroupName;
      return resourseName;
    };

    // Listen to all records changed
    this.firewallsListSource.findAllRecordsMapStream(keyFn)
      .catch((error) => {
        this.listStatusFactory.setError();
        return Observable.throw(error);
      })
      .subscribe((response) => {
        this.firewallsMap = response;
        this.search.showLoading(false);
        this.listStatusFactory.setSuccesfull(response);
      });
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
      .subscribe((response) => {
        if (!isNullOrEmpty(response)) {
          this.selectedFirewall = response;
          this._setSelectedFirewallInfo(response);
          this._firewallService.setSelectedFirewall(this.selectedFirewall);
          this._changeDetectorRef.markForCheck();
        }
      });
  }

  /**
   * This will set the selected firewall details every selection
   */
  private _setSelectedFirewallInfo(selectedFirewall: Firewall): void {
    if (isNullOrEmpty(selectedFirewall)) { return; }
    this.selectedFirewall = selectedFirewall;
  }
}
