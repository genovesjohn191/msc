import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventBusState } from './event-bus-state.enum';
import { EventBusDispatcherCore } from './event-bus-dispatcher-core';

@Injectable()
export class EventBusDispatcherService {
  private _eventDispatcherRef: EventBusDispatcherCore;

  constructor() {
    this._eventDispatcherRef = EventBusDispatcherCore.getInstance();
  }

  /**
   * Attaches a new event handler to the provided event name
   * @param event Event name to where the handler will be attached
   * @param callback Event handler callback to be called when the event emitted
   */
  public addEventListener(
    event: EventBusState,
    callback: (...args: any[]) => void
  ): Subscription {
    return this._eventDispatcherRef.addEventListener(event, callback);
  }

  /**
   * Dispatches an event based on the event name provided and emit the provided arguments
   * @param event Event name of the event to dispatch
   * @param args Arguments to be dispatched on the event
   */
  public dispatchEvent<T>(event: EventBusState, ...args: T[]): void {
    this._eventDispatcherRef.dispatchEvent(event, args);
  }
}
