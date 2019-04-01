import {
  Subscription,
  Subject
} from 'rxjs';
import {
  isNullOrUndefined,
  isNullOrEmpty
} from '@app/utilities';
import { EventBusState } from './event-bus-state';

export interface EventBusObject<T> {
  flag?: EventBusState<T>;
  latestPayload?: T;
  subject?: Subject<T>;
}

export class EventBusDispatcherCore {
  /**
   * Returns the instance of the event dispatcher class
   */
  public static getInstance(): EventBusDispatcherCore {
    if (isNullOrUndefined(this._eventDispatcherInstance)) {
      this._eventDispatcherInstance = new EventBusDispatcherCore();
    }
    return this._eventDispatcherInstance;
  }
  private static _eventDispatcherInstance: EventBusDispatcherCore;
  private _eventsStorageMap = new Map<string, EventBusObject<any>>();

  private constructor() { }

  /**
   * Attaches a new event handler to the provided event name
   * @param event Event name to where the handler will be attached
   * @param callback Event handler callback to be called when the event emitted
   */
  public addEventListener<T>(event: EventBusState<T>, callback: (args: T) => void): Subscription {
    let eventObject = this._getEventObjectFromCache<any>(event);
    return eventObject.subject.subscribe((eventArg) => {
      callback.call(this, eventArg);
    });
  }

  /**
   * Dispatches an event based on the event name provided and emit the provided arguments
   * @param event Event name of the event to dispatch
   * @param args Arguments to be dispatched on the event
   */
  public dispatch<T>(event: EventBusState<T>, payload: T): void {
    let eventObject = this._getEventObjectFromCache(event);
    eventObject.latestPayload = isNullOrEmpty(payload) ? eventObject.latestPayload : payload;
    eventObject.subject.next(eventObject.latestPayload);
  }

  /**
   * Get the actual event instance
   * @param event Event to be obtained
   */
  public getEvent<T>(event: EventBusState<T>): EventBusObject<T> {
    return this._getEventObjectFromCache<any>(event);
  }

  /**
   * Cache all the event objects
   * @param event Event name to be registered in the cache
   */
  private _getEventObjectFromCache<T>(event: EventBusState<T>): EventBusObject<T> {
    let eventIsNotRegistered = !this._eventsStorageMap.has(event.eventName);
    let eventObject = {} as EventBusObject<T>;

    if (eventIsNotRegistered) {
      eventObject.flag = event;
      eventObject.subject = new Subject<T>();
      eventObject.latestPayload = null;
      this._eventsStorageMap.set(event.eventName, eventObject);
    }
    return this._eventsStorageMap.get(event.eventName);
  }
}
