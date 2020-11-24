import { Injector } from '@angular/core';
import { McsNavigationService } from '@app/core';
import { RouteKey } from '@app/models';
import { IOrderEventStrategy } from '../order-event.strategy';

export class SimpleFirewallChangeRemoveEvent implements IOrderEventStrategy {

  private _navigationService: McsNavigationService;

  public setInjector(injector: Injector): void {
    this._navigationService = injector.get(McsNavigationService);
  }

  // TO DO: enable when remove simple firewall change is complete
  public executeEvent(): void {
    // this._navigationService.navigateTo(RouteKey.OrderRemoveSimpleFirewallChange);
  }
}
