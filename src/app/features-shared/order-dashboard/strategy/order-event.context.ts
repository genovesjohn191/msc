import { Injector } from '@angular/core';
import { IOrderEventStrategy } from './order-event.strategy';

export class OrderEventContext {
  private _eventStrategy: IOrderEventStrategy;

  constructor(private _injector: Injector) { }

  public setEventStrategy(eventStrategy: IOrderEventStrategy): void {
    this._eventStrategy = eventStrategy;
  }

  public executeEvent(): void {
    this._eventStrategy.setInjector(this._injector);
    this._eventStrategy.executeEvent();
  }
}
