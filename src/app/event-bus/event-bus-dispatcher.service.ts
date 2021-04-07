import { Subscription } from 'rxjs';

import { Injectable } from '@angular/core';

import { EventBusDispatcherCore } from './event-bus-dispatcher-core';
import { EventBusState } from './event-bus-state';

@Injectable()
export class EventBusDispatcherService {
  private _eventDispatcherRef: EventBusDispatcherCore;

  constructor() {
    this._eventDispatcherRef = EventBusDispatcherCore.getInstance();
  }

  public addEventListener<T>(event: EventBusState<T>, callback: (payload: T) => void): Subscription {
    return this._eventDispatcherRef.addEventListener(event, callback);
  }

  public dispatch<T>(eventState: EventBusState<T>): void;
  public dispatch<T>(eventState: EventBusState<T>, payload?: T): void;
  public dispatch<T>(eventState: EventBusState<T>, payload?: T): void {
    this._eventDispatcherRef.dispatch(eventState, payload);
  }
}
