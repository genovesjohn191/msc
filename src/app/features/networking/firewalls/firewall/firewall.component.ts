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
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import { Observable } from 'rxjs/Rx';
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
import { FirewallsService } from '../firewalls.service';
import { FirewallService } from './firewall.service';
import { FirewallListSource } from './firewall.listsource';
import {
  isNullOrEmpty,
  refreshView
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
  public subscription: any;
  public firewallListSource: FirewallListSource | null;
  public header: string;

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
      if (this.subscription) {
        this.subscription.unsubscribe();
      }

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
    private _firewallsService: FirewallsService,
    private _firewallService: FirewallService
  ) {
    super(_router, _activatedRoute);
    this.firewall = new Firewall();
  }

  public ngOnInit() {
    this.firewallsTextContent = this._textContentProvider.content.firewalls;
    this.firewallTextContent = this._textContentProvider.content.firewalls.firewall;
    this._getFirewallById();
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this._initializeListsource();
    });
  }

  public ngOnDestroy() {
    super.dispose();
    if (!isNullOrEmpty(this.subscription)) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Navigate on the selected firewall overview page and
   * set the selected firewall to update selectedFirewallStream
   * @param firewallId
   */
  public onFirewallSelect(firewallId: any): void {
    if (isNullOrEmpty(firewallId)) { return; }

    this.router.navigate(
      ['/networking/firewalls', firewallId],
      { relativeTo: this.activatedRoute }
    );
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

  public onTabChanged(tab: any) {
    if (isNullOrEmpty(this.firewall) || isNullOrEmpty(this.firewall.id)) { return; }
    // Navigate route based on current active tab
    if (tab.id === 'overview') {
      this.router.navigate([`networking/firewalls/${this.firewall.id}/overview`]);
    } else {
      this.router.navigate([`networking/firewalls/${this.firewall.id}/policies`]);
    }
  }

  private _initializeListsource(): void {
    this.firewallListSource = new FirewallListSource(
      this._firewallsService,
      this._listSearch
    );
    this._changeDetectorRef.markForCheck();
  }

  private _getFirewallById(): void {
    this.subscription = this.activatedRoute.paramMap
      .switchMap((params: ParamMap) => {
        let firewallId = params.get('id');
        return this._firewallService.getFirewall(firewallId);
      })
      .catch((error) => {
        // Handle common error status code
        this._errorHandlerService.handleHttpRedirectionError(error.status);
        return Observable.throw(error);
      })
      .subscribe((response) => {
        if (!isNullOrEmpty(response)) {
          this.firewall = response.content;
          this.selectedItem = {
            itemId: this.firewall.id,
            groupName: this.firewall.haGroupName
          } as McsListPanelItem;
          this.header = `${this.firewall.managementName} (${this.firewall.haRole})`;
          this._firewallService.setSelectedFirewall(this.firewall);
          this._changeDetectorRef.markForCheck();
        }
      });
  }
}
