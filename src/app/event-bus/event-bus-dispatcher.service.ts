import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventBusItem } from './event-bus-item.enum';
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
    event: EventBusItem,
    callback: (...args: any[]) => void
  ): Subscription {
    return this._eventDispatcherRef.addEventListener(event, callback);
  }

  /**
   * Dispatches an event based on the event name provided and emit the provided arguments
   * @param event Event name of the event to dispatch
   * @param args Arguments to be dispatched on the event
   */
  public dispatchEvent<T>(event: EventBusItem, ...args: T[]): void {
    this._eventDispatcherRef.dispatchEvent(event, args);
  }

  /**
   * Dispatches all the events accordingly
   * @param events Events to be dispatched
   */
  public dispatchEvents(...events: EventBusItem[]): void {
    this._eventDispatcherRef.dispatchEvents(...events);
  }

  /**
   * Clears the associated params/arguments of the event
   * @param event Event to clear the params/arguments
   */
  public clearEventObject(event: EventBusItem): void {
    this._eventDispatcherRef.clearEventObject(event);
  }
}
