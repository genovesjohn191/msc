import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { McsNetworkDnsSummary } from '@app/models';
import { DnsService } from '../../dns.service';
import { map, shareReplay, switchMap, take } from 'rxjs/operators';
import { getSafeProperty, isNullOrEmpty } from '@app/utilities';
@Component({
  selector: 'mcs-dns-management',
  templateUrl: './dns-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DnsManagementComponent {

  public selectedDns$: Observable<McsNetworkDnsSummary>;
  public isPrimaryDns: boolean;
  public zoneCount: string;

  public constructor(private _dnsService: DnsService) {
    this.selectedDns$ = this._dnsService.getDnsDetails().pipe(
      map((selectedDns) => {
        this.isPrimaryDns = selectedDns.isPrimary;
        let zones = getSafeProperty(selectedDns, (obj) => obj.zones, []);
        this.zoneCount = zones.length.toString();
        return selectedDns;
      }),
      shareReplay(1)
    );
  }

  public get isPrimary(): string {
    return (this.isPrimaryDns) ? 'Primary' : 'Secondary';
  }

}
