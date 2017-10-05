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
import {
  CoreDefinition,
  McsTextContentProvider,
  McsSearch,
  McsListPanelItem
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

@Component({
  selector: 'mcs-firewall',
  styles: [require('./firewall.component.scss')],
  templateUrl: './firewall.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FirewallComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('listSearch')
  public _listSearch: McsSearch;

  public firewallsTextContent: any;
  public firewallTextContent: any;
  public subscription: any;
  public firewallListSource: FirewallListSource | null;

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
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _firewallsService: FirewallsService,
    private _firewallService: FirewallService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute
  ) {
    this.firewall = new Firewall();
  }

  public ngOnInit() {
    // OnInit
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
    // OnDestroy
    if (this.subscription) {
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

    this._router.navigate(
      ['/networking/firewalls', firewallId],
      { relativeTo: this._activatedRoute }
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

  private _initializeListsource(): void {
    this.firewallListSource = new FirewallListSource(
      this._firewallsService,
      this._listSearch
    );
    this._changeDetectorRef.markForCheck();
  }

  private _getFirewallById(): void {
    this.subscription = this._activatedRoute.paramMap
      .switchMap((params: ParamMap) => {
        let firewallId = params.get('id');
        return this._firewallService.getFirewall(firewallId);
      })
      .subscribe((response) => {
        if (!isNullOrEmpty(response)) {
          this.firewall = response.content;
          this.selectedItem = {
            itemId: this.firewall.id,
            groupName: this.firewall.haGroupName
          } as McsListPanelItem;
          this._firewallService.setSelectedFirewall(this.firewall);
          this._changeDetectorRef.markForCheck();
        }
      });

  }
}
