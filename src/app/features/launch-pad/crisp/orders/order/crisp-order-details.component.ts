import {
  ChangeDetectionStrategy,
  Component,
  Injector
} from '@angular/core';
import { Observable } from 'rxjs';
import {
  map,
  shareReplay,
  tap
} from 'rxjs/operators';

import { McsObjectCrispOrder } from '@app/models';
import {
  CommonDefinition,
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';
import { CrispOrderService } from './crisp-order.service';
import { ActivatedRoute } from '@angular/router';
import { McsAuthenticationIdentity } from '@app/core';

@Component({
  selector: 'mcs-crisp-order-details',
  templateUrl: './crisp-order-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrispOrderDetailsComponent {
  public crispOrder$: Observable<McsObjectCrispOrder>;

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get crispHost(): string {
    return this._authenticationIdentity.metadataLinks.find((link) => link.key === 'crisp_host')?.value;
  }

  public constructor(
    _injector: Injector,
    private _activatedRoute: ActivatedRoute,
    private _crispOrderService: CrispOrderService,
    private _authenticationIdentity: McsAuthenticationIdentity
  ) {
    this._subscribeToCrispOrderResolve();
  }

  private _subscribeToCrispOrderResolve(): void {
    this.crispOrder$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.crispOrder)),
      tap((crispOrder) => {
        if (isNullOrEmpty(crispOrder)) { return; }

        this._crispOrderService.setCrispOrderDetails(crispOrder);
      }),
      shareReplay(1)
    );
  }
}
