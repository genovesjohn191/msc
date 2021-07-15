import {
  Observable,
  Subject
} from 'rxjs';
import {
  shareReplay,
  takeUntil
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component
} from '@angular/core';
import { McsNetworkDbNetwork } from '@app/models';
import { NetworkDbNetworkDetailsService } from '../network-db-network.service';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';

@Component({
  selector: 'mcs-network-db-network-overview',
  templateUrl: './network-db-network-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NetworkDbNetworkOverviewComponent {
  public network$: Observable<McsNetworkDbNetwork>;
  private _destroySubject = new Subject<void>();
  public constructor(
    private _networkDetailService: NetworkDbNetworkDetailsService,
    private _eventDispatcher: EventBusDispatcherService,
    private _changeDetector: ChangeDetectorRef
    ) {
      this._subscribeToNetworkDetails();
      this._watchNetworkDbChanges();
  }

  private _subscribeToNetworkDetails(): void {
    this.network$ = this._networkDetailService.getNetworkDetails().pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );
  }

  private _watchNetworkDbChanges(): void {
    this._eventDispatcher.addEventListener(McsEvent.dataChangeNetworkDbNetworksEvent, (payload) => {
      this._changeDetector.markForCheck();
    });
  }
}