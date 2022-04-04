import {
  map,
  shareReplay,
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
import {
  McsPageBase,
  McsTabEvents
} from '@app/core';
import {
  McsNetworkDbVlan,
  RouteKey
} from '@app/models';

@Component({
  selector: 'mcs-network-vlan',
  templateUrl: './network-vlan.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NetworkVlanComponent extends McsPageBase implements OnInit, OnDestroy {
  public vlan$: Observable<McsNetworkDbVlan>;
  public readonly tabEvents: McsTabEvents;

  private _vlanChange = new BehaviorSubject<McsNetworkDbVlan>(null);

  public constructor(
    injector: Injector
  ) {
    super(injector);
    this.tabEvents = new McsTabEvents(injector);
  }

  public ngOnInit(): void {
    this._subscribeToVlanResolve();
  }

  public ngOnDestroy(): void {
    this.dispose();
    this.tabEvents.dispose();
  }

  public getTitle(vlan: McsNetworkDbVlan): string {
    return `VLAN ${vlan?.number}`;
  }

  public onTabChanged(tab: any) {
    let vlanId = this._vlanChange.getValue()?.id;

    this.navigation.navigateTo(
      RouteKey.LaunchPadNetworkDbVlanDetails,
      [vlanId, tab.id]
    );
  }

  private _subscribeToVlanResolve(): void {
    this.vlan$ = this._vlanChange.pipe(
      takeUntil(this.destroySubject),
      shareReplay(1)
    );

    this.activatedRoute.data.pipe(
      takeUntil(this.destroySubject),
      map(resolver => resolver?.vlan),
      tap(vlan => this._vlanChange.next(vlan))
    ).subscribe();
  }
}