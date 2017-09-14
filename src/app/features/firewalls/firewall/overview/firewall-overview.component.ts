import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import { McsTextContentProvider } from '../../../../core';
import { Firewall } from '../../models';
import { FirewallService } from '../firewall.service';
import { convertToGb } from '../../../../utilities';

@Component({
  selector: 'mcs-firewall-overview',
  styles: [require('./firewall-overview.component.scss')],
  templateUrl: './firewall-overview.component.html'
})

export class FirewallOverviewComponent implements OnInit, OnDestroy {
  public firewallOverviewTextContent: any;
  public firewall: Firewall;
  public subscription: any;
  public firewallCpu: string;
  public firewallMemory: string;

  constructor(
    private _textContentProvider: McsTextContentProvider,
    private _firewallService: FirewallService
  ) {
    this.firewall = new Firewall();
    this.firewallCpu = '';
    this.firewallMemory = '';
  }

  public ngOnInit(): void {
    // OnInit
    this.firewallOverviewTextContent =
      this._textContentProvider.content.firewalls.firewall.overview;

    this._initializeFirewallData();
  }

  public ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private _initializeFirewallData(): void {
    let cpuUnit = this.firewallOverviewTextContent.resources.cpuUnit;
    let ramUnit = this.firewallOverviewTextContent.resources.ramUnit;

    this.subscription = this._firewallService.selectedFirewallStream
      .subscribe((firewall) => {
        this.firewall = firewall;
        this.firewallCpu = `${firewall.cpuCount} ${cpuUnit}`;
        this.firewallMemory = `${convertToGb(firewall.memoryMB)} ${ramUnit}`;
      });
  }
}
