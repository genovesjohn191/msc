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
  Component
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import {
  McsNetworkDbNetwork
} from '@app/models';
import { NetworkDbNetworkDetailsService } from '../network-db-network.service';

@Component({
  selector: 'mcs-network-db-network-overview',
  templateUrl: './network-db-network-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NetworkDbNetworkOverviewComponent {
  public network$: Observable<McsNetworkDbNetwork>;
  private _destroySubject = new Subject<void>();
  public constructor(
    private _networkDetailService: NetworkDbNetworkDetailsService) {
    this._subscribeToDeploymentDetails()
  }

  private _subscribeToDeploymentDetails(): void {
    this.network$ = this._networkDetailService.getNetworkDetails().pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );
  }

}