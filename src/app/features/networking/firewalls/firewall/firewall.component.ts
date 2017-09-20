import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild
} from '@angular/core';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsSearch
} from '../../../../core';
import { Firewall } from '../models';
import { FirewallsService } from '../firewalls.service';
import { FirewallService } from './firewall.service';
import { FirewallListSource } from './firewall.listsource';
import { isNullOrEmpty } from '../../../../utilities';

@Component({
  selector: 'mcs-firewall',
  styles: [require('./firewall.component.scss')],
  templateUrl: './firewall.component.html'
})
export class FirewallComponent implements OnInit, OnDestroy {
  @ViewChild('listSearch')
  public _listSearch: McsSearch;

  public firewallTextContent: any;
  public firewallName: string;
  public subscription: any;
  public firewallListSource: FirewallListSource | null;

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public get firewallIconKey(): string {
    return CoreDefinition.ASSETS_SVG_ADD_BLUE;
  }

  public get hasFirewallData(): boolean {
    return !isNullOrEmpty(this.firewallName);
  }

  constructor(
    private _textContentProvider: McsTextContentProvider,
    private _firewallsService: FirewallsService,
    private _firewallService: FirewallService,
    private _router: Router,
    private _route: ActivatedRoute
  ) {
    this.firewallName = '';
  }

  public ngOnInit() {
    // OnInit
    this.firewallTextContent = this._textContentProvider.content.firewalls.firewall;
    this._firewallService.setSelectedFirewall(this._route.snapshot.paramMap.get('id'));
    this.subscription = this._firewallService.selectedFirewallStream
      .subscribe((firewall) => {
        this.firewallName = firewall.managementName;
      });
    this._initializeListsource();
  }

  /**
   * Navigate on the selected firewall overview page and
   * set the selected firewall to update selectedFirewallStream
   * @param firewallId
   */
  public onFirewallSelect(firewallId: any) {
    if (firewallId) {
      this._router.navigate(['/networking/firewalls', firewallId]);
      this._firewallService.setSelectedFirewall(firewallId);
    }
  }

  public ngOnDestroy() {
    // OnDestroy
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private _initializeListsource(): void {
    this.firewallListSource = new FirewallListSource(
      this._firewallsService,
      this._firewallService,
      this._listSearch
    );
  }
}
