import { Injector } from '@angular/core';
import { McsNavigationService } from '@app/core';
import { RouteKey } from '@app/models';
import { IOrderEventStrategy } from '../order-event.strategy';

export class SimpleFirewallChangeModifyEvent implements IOrderEventStrategy {

  private _navigationService: McsNavigationService;

  public setInjector(injector: Injector): void {
    this._navigationService = injector.get(McsNavigationService);
  }

  public executeEvent(): void {
     this._navigationService.navigateTo(RouteKey.OrderModifySimpleFirewallChange);
  }
}
