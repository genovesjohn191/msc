import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  McsTextContentProvider,
  CoreDefinition
} from '../../../../../core';
import {
  Firewall,
  FirewallDeviceStatus,
  FirewallConnectionStatus,
  FirewallConfigurationStatus
} from '../../models';
import { FirewallService } from '../firewall.service';
import {
  isNullOrEmpty,
  convertToGb,
  reviverParser,
  formatDate,
  compareDates,
  getExpiryLabel,
  unsubscribeSafely
} from '../../../../../utilities';

@Component({
  selector: 'mcs-firewall-overview',
  styleUrls: ['./firewall-overview.component.scss'],
  templateUrl: './firewall-overview.component.html'
})

export class FirewallOverviewComponent implements OnInit, OnDestroy {
  public firewallOverviewTextContent: any;
  public firewall: Firewall;
  public subscription: any;
  public firewallCpu: string;
  public firewallMemory: string;

  public deviceStatusIconKey: string;
  public connectionStatusIconKey: string;
  public configurationStatusIconKey: string;

  public get deviceStatus()  {
    return FirewallDeviceStatus;
  }

  public get connectionStatus() {
    return FirewallConnectionStatus;
  }

  public get configurationStatus() {
    return FirewallConfigurationStatus;
  }

  constructor(
    private _textContentProvider: McsTextContentProvider,
    private _firewallService: FirewallService
  ) {
    this.firewall = new Firewall();
    this.firewallCpu = '';
    this.firewallMemory = '';
    this.deviceStatusIconKey = '';
    this.connectionStatusIconKey = '';
    this.configurationStatusIconKey = '';
  }

  public ngOnInit(): void {
    // OnInit
    this.firewallOverviewTextContent =
      this._textContentProvider.content.firewalls.firewall.overview;

    this._initializeFirewallData();
  }

  public getLicenseDetails(expiry: string): string {
    let convertedDate = reviverParser('expiry', expiry);

    let license = this._validateLicense(convertedDate) ?
      this.firewallOverviewTextContent.utmServices.licensed :
      this.firewallOverviewTextContent.utmServices.invalidLicense;
    let expires = getExpiryLabel(convertedDate);
    let expiryDate = formatDate(convertedDate, 'YYYY-MM-DD');

    return `${license} (${expires} ${expiryDate})`;
  }

  public getLicenseStatusIconKey(expiry: string): string {
    let convertedDate = reviverParser('expiry', expiry);

    return this._validateLicense(convertedDate) ?
      CoreDefinition.ASSETS_SVG_STATE_RUNNING :
      CoreDefinition.ASSETS_SVG_STATE_STOPPED ;
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this.subscription);
  }

  private _initializeFirewallData(): void {
    let cpuUnit = this.firewallOverviewTextContent.properties.cpuUnit;
    let ramUnit = this.firewallOverviewTextContent.properties.ramUnit;

    this.subscription = this._firewallService.selectedFirewallStream
      .subscribe((firewall) => {
        if (isNullOrEmpty(firewall)) { return; }

        this.firewall = firewall;
        this.firewallCpu = `${firewall.cpuCount} ${cpuUnit}`;
        this.firewallMemory = `${convertToGb(firewall.memoryMB)} ${ramUnit}`;

        this._setDeviceStatusIconKey();
        this._setConnectionStatusIconKey();
        this._setConfigurationStatusIconKey();
      });
  }

  private _validateLicense(expiry: Date): boolean {
    return compareDates(expiry, new Date()) >= 0;
  }

  private _setDeviceStatusIconKey(): void {
    this.deviceStatusIconKey = this._firewallService
      .getFirewallDeviceStatusIconKey(this.firewall.deviceStatus);
  }

  private _setConnectionStatusIconKey(): void {
    this.connectionStatusIconKey = this._firewallService
      .getFirewallConnectionStatusIconKey(this.firewall.connectionStatus);
  }

  private _setConfigurationStatusIconKey(): void {
    this.configurationStatusIconKey = this._firewallService
      .getFirewallConfigurationStatusIconKey(this.firewall.configurationStatus);
  }
}
