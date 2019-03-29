import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventBusDispatcherCore } from './event-bus-dispatcher-core';
import { EventBusState } from './event-bus-state';

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
  public addEventListener<T>(event: EventBusState<T>, callback: (payload: T) => void): Subscription {
    return this._eventDispatcherRef.addEventListener(event, callback);
  }

  /**
   * Dispatches an event based on the event state provided
   * @param eventState Event state to be invoked
   */
  public dispatch<T>(eventState: EventBusState<T>): void;

  /**
   * Dispatches an event based on the event state provided and payload
   * @param eventState Event state to dispatch
   * @param payload Payload to be dispatched
   */
  public dispatch<T>(eventState: EventBusState<T>, payload?: T): void;

  /**
   * Dispatches an event based on the event state provided and payload
   * @param eventState Event state to be invoked
   * @param payload Payload to be invoked
   */
  public dispatch<T>(eventState: EventBusState<T>, payload?: T): void {
    this._eventDispatcherRef.dispatch(eventState, payload);
  }
}
