import {
  map,
  takeUntil,
  tap,
  BehaviorSubject,
  Observable
} from 'rxjs';

import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  OnInit
} from '@angular/core';
import { McsPageBase } from '@app/core';
import { McsNetworkDbVlan } from '@app/models';

@Component({
  selector: 'mcs-network-vlan-overview',
  templateUrl: './vlan-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NetworkVlanOverviewComponent extends McsPageBase implements OnInit, OnDestroy {
  public vlan$: Observable<McsNetworkDbVlan>;

  private _vlanIdChange = new BehaviorSubject<string>(null);

  public constructor(
    injector: Injector
  ) {
    super(injector);
  }

  public ngOnInit(): void {
    this._subscribeToVlanResolver();
  }

  public ngOnDestroy(): void {
  }

  private _subscribeToVlanResolver(): void {
    this.activatedRoute.data.pipe(
      takeUntil(this.destroySubject),
      map(resolver => resolver?.vlan),
      tap(vlan => this._vlanIdChange.next(vlan?.id))
    ).subscribe();
  }
}