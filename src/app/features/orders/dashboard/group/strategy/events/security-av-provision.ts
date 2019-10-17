import { Injector } from '@angular/core';
import { McsNavigationService } from '@app/core';
import { RouteKey } from '@app/models';
import { IOrderEventStrategy } from '../order-event.strategy';

export class SecurityAvProvisionEvent implements IOrderEventStrategy {

  private _navigationService: McsNavigationService;

  public setInjector(injector: Injector): void {
    this._navigationService = injector.get(McsNavigationService);
  }

  public executeEvent(): void {
    // TODO: This feature is not yet implemented
    this._navigationService.navigateTo(RouteKey.OrderVdcStorageExpand);
  }
}
