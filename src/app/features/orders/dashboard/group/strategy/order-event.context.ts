import { Injector } from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';
import { IOrderEventStrategy } from './order-event.strategy';
import { orderEventMap } from './order-event.map';

export class OrderEventContext {
  private _eventStrategy: IOrderEventStrategy;

  constructor(private _injector: Injector) { }

  public setEventStrategyByType(type: string): void {
    let eventStrategy = orderEventMap[type];
    if (isNullOrEmpty(eventStrategy)) {
      throw new Error(`Unable to find strategy for type ${type}.
        Please make sure you've registered the type in the event map`);
    }
    this._eventStrategy = eventStrategy;
  }

  public executeEvent(): void {
    this._eventStrategy.setInjector(this._injector);
    this._eventStrategy.executeEvent();
  }
}
