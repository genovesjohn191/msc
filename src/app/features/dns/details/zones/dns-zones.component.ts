import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'mcs-dns-zones',
  templateUrl: './dns-zones.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DnsZonesComponent implements OnInit, OnDestroy {

  public constructor(){

  }

  public ngOnInit() {
  }

  public ngOnDestroy() {
  }
}
