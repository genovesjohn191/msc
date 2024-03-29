import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { McsDateTimeService } from '@app/core';
import {
  isNullOrEmpty,
  compareDates,
  getExpiryLabel,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';
import { McsFirewall } from '@app/models';
import { FirewallService } from '../firewall.service';

@Component({
  selector: 'mcs-firewall-overview',
  templateUrl: './firewall-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})

export class FirewallOverviewComponent implements OnInit, OnDestroy {
  public firewall: McsFirewall;

  private _destroySubject = new Subject<void>();

  constructor(
    private _dateTimeService: McsDateTimeService,
    private _translateService: TranslateService,
    private _firewallService: FirewallService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.firewall = new McsFirewall();
  }

  public ngOnInit(): void {
    this._listenToFirewallSelection();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * Returns the license date label based on its expiration date
   * @param expirationDate Expiration date to be checked
   */
  public getLicenseText(expirationDate: Date): string {
    if (isNullOrEmpty(expirationDate)) { return undefined; }
    let dateIsExpired = this._isDateExpired(expirationDate);
    let licenseText = dateIsExpired ?
      this._translateService.instant('firewall.overview.utmServices.invalidLicense') :
      this._translateService.instant('firewall.overview.utmServices.licensed');

    let formattedDate = this._dateTimeService.formatDate(expirationDate, 'shortDate');
    return `${licenseText} (${getExpiryLabel(expirationDate)} ${formattedDate})`;
  }

  /**
   * Returns the license icon key based on its expiry date
   * @param expirationDate Expiration date to be checked
   */
  public getLicenseIconKey(expirationDate: Date): string {
    if (isNullOrEmpty(expirationDate)) { return CommonDefinition.ASSETS_SVG_STATE_STOPPED; }
    return this._isDateExpired(expirationDate) ?
      CommonDefinition.ASSETS_SVG_STATE_STOPPED :
      CommonDefinition.ASSETS_SVG_STATE_RUNNING;
  }

  /**
   * Returns true when the date is expired
   * @param expiry Expiry date to be checked
   */
  private _isDateExpired(expiry: Date): boolean {
    return compareDates(new Date(), expiry) >= 0;
  }

  /**
   * Listens to firewall selections
   */
  private _listenToFirewallSelection(): void {
    this._firewallService.selectedFirewallChange
      .pipe(takeUntil(this._destroySubject))
      .subscribe((firewall) => {
        if (isNullOrEmpty(firewall)) { return; }
        this.firewall = firewall;
        this._changeDetectorRef.markForCheck();
      });
  }
}
