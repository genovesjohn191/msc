import { Injector } from '@angular/core';
import { McsNavigationService } from '@app/core';
import { RouteKey } from '@app/models';
import { IOrderEventStrategy } from '../order-event.strategy';

export class VmBackupProvisionEvent implements IOrderEventStrategy {

  private _navigationService: McsNavigationService;

  public setInjector(injector: Injector): void {
    this._navigationService = injector.get(McsNavigationService);
  }

  public executeEvent(): void {
    // TODO: Double check the url, seems like it is not right
    this._navigationService.navigateTo(RouteKey.ServerDetailsBackups);
  }
}