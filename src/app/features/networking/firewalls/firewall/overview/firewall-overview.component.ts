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
  convertMbToGb,
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
  public textContent: any;
  public firewall: Firewall;
  public subscription: any;

  public deviceStatusIconKey: string;
  public connectionStatusIconKey: string;
  public configurationStatusIconKey: string;

  public get firewallModel(): string {
    return !isNullOrEmpty(this.firewall.model) ?
      this.firewall.model : this.textContent.properties.unknown;
  }

  public get firewallCpu(): string {
    return !isNullOrEmpty(this.firewall.cpuCount) ?
      `${this.firewall.cpuCount} ${this.textContent.properties.cpuUnit}` :
      this.textContent.properties.unknown;
  }

  public get firewallMemory(): string {
    return !isNullOrEmpty(this.firewall.memoryMB) ?
      `${convertMbToGb(this.firewall.memoryMB)} ${this.textContent.properties.ramUnit}` :
      this.textContent.properties.unknown;
  }

  public get deviceStatus()  {
    return FirewallDeviceStatus;
  }

  public get connectionStatus() {
    return FirewallConnectionStatus;
  }

  public get configurationStatus() {
    return FirewallConfigurationStatus;
  }

  public get hasUtmInformation(): boolean {
    return !isNullOrEmpty(this.firewall.utm) &&
      (!isNullOrEmpty(this.firewall.utm.avExpiryDate) ||
      !isNullOrEmpty(this.firewall.utm.emailExpiryDate) ||
      !isNullOrEmpty(this.firewall.utm.webExpiryDate));
  }

  public get hasTopologyInformation(): boolean {
    return !isNullOrEmpty(this.firewall.haRole) || !isNullOrEmpty(this.firewall.haGroupName);
  }

  constructor(
    private _textContentProvider: McsTextContentProvider,
    private _firewallService: FirewallService
  ) {
    this.firewall = new Firewall();
    this.deviceStatusIconKey = '';
    this.connectionStatusIconKey = '';
    this.configurationStatusIconKey = '';
  }

  public ngOnInit(): void {
    // OnInit
    this.textContent =
      this._textContentProvider.content.firewalls.firewall.overview;

    this._initializeFirewallData();
  }

  public getLicenseDetails(expiry: string): string {
    let convertedDate = reviverParser('expiry', expiry);

    let license = this._validateLicense(convertedDate) ?
      this.textContent.utmServices.licensed :
      this.textContent.utmServices.invalidLicense;
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
    this.subscription = this._firewallService.selectedFirewallStream
      .subscribe((firewall) => {
        if (isNullOrEmpty(firewall)) { return; }
        this.firewall = firewall;
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
