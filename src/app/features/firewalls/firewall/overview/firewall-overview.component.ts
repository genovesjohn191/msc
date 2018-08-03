import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  McsTextContentProvider,
  CoreDefinition
} from '../../../../core';
import {
  isNullOrEmpty,
  formatDate,
  compareDates,
  getExpiryLabel,
  unsubscribeSubject
} from '../../../../utilities';
import { Firewall } from '../../models';
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
  public textContent: any;
  public firewall: Firewall;

  private _destroySubject = new Subject<void>();

  constructor(
    private _textContentProvider: McsTextContentProvider,
    private _firewallService: FirewallService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.firewall = new Firewall();
  }

  public ngOnInit(): void {
    this.textContent = this._textContentProvider.content.firewalls.firewall.overview;
    this._listenToFirewallSelection();
  }

  public ngOnDestroy(): void {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Returns the license date label based on its expiration date
   * @param expirationDate Expiration date to be checked
   */
  public getLicenseText(expirationDate: Date): string {
    if (isNullOrEmpty(expirationDate)) { return undefined; }
    let dateIsExpired = this._isDateExpired(expirationDate);
    let licenseText = dateIsExpired ?
      this.textContent.utmServices.invalidLicense :
      this.textContent.utmServices.licensed;

    let formattedDate = formatDate(expirationDate, 'YYYY-MM-DD');
    return `${licenseText} (${getExpiryLabel(expirationDate)} ${formattedDate})`;
  }

  /**
   * Returns the license icon key based on its expiry date
   * @param expirationDate Expiration date to be checked
   */
  public getLicenseIconKey(expirationDate: Date): string {
    if (isNullOrEmpty(expirationDate)) { return CoreDefinition.ASSETS_SVG_STATE_STOPPED; }
    return this._isDateExpired(expirationDate) ?
      CoreDefinition.ASSETS_SVG_STATE_STOPPED :
      CoreDefinition.ASSETS_SVG_STATE_RUNNING;
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