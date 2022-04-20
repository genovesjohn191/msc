import {
  map,
  takeUntil,
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

  public constructor(
    injector: Injector
  ) {
    super(injector);
  }

  public get featureName(): string {
    return 'vlan-overview';
  }

  public ngOnInit(): void {
    this._subscribeToVlanResolver();
  }

  public ngOnDestroy(): void {
  }

  private _subscribeToVlanResolver(): void {
    this.vlan$ = this.activatedRoute.parent.data.pipe(
      takeUntil(this.destroySubject),
      map(resolver => resolver?.vlan)
    );
  }
}