import {
  Subscription,
  Subject
} from 'rxjs';
import { isNullOrUndefined } from '@app/utilities';
import { EventBusItem } from './event-bus-item.enum';

export interface EventBusHandler<T> {
  params: T[];
}

export interface EventBusObject<T> {
  flag?: number;
  latestArgs?: T[];
  subject?: Subject<EventBusHandler<T>>;
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
  private _eventsStorageMap = new Map<EventBusItem, EventBusObject<any>>();

  private constructor() { }

  /**
   * Attaches a new event handler to the provided event name
   * @param event Event name to where the handler will be attached
   * @param callback Event handler callback to be called when the event emitted
   */
  public addEventListener(event: EventBusItem, callback: (...args: any[]) => void): Subscription {
    let eventObject = this._getEventObjectFromCache<any>(event);
    return eventObject.subject.subscribe((eventArg) => {
      callback.apply(this, ...eventArg.params);
    });
  }

  /**
   * Dispatches an event based on the event name provided and emit the provided arguments
   * @param event Event name of the event to dispatch
   * @param args Arguments to be dispatched on the event
   */
  public dispatchEvent<T>(event: EventBusItem, ...args: T[]): void {
    let eventObject = this._getEventObjectFromCache(event);
    eventObject.latestArgs = args;
    eventObject.subject.next({ params: args });
  }

  /**
   * Dispatches all the events accordingly
   * @param events Events to be dispatched
   */
  public dispatchEvents(...events: EventBusItem[]): void {
    events.forEach((event) => {
      let eventObject = this._getEventObjectFromCache(event);
      eventObject.subject.next({ params: eventObject.latestArgs });
    });
  }

  /**
   * Clears the associated params/arguments of the event
   * @param event Event to clear the params/arguments
   */
  public clearEventObject(event: EventBusItem): void {
    let eventObject = this._getEventObjectFromCache(event);
    eventObject.subject.next({ params: [] });
  }

  /**
   * Get the actual event instance
   * @param event Event to be obtained
   */
  public getEvent<T>(event: EventBusItem): EventBusObject<T> {
    return this._getEventObjectFromCache<any>(event);
  }

  /**
   * Cache all the event objects
   * @param event Event name to be registered in the cache
   */
  private _getEventObjectFromCache<T>(event: EventBusItem): EventBusObject<T> {
    let eventIsNotRegistered = !this._eventsStorageMap.has(event);
    let eventObject = {} as EventBusObject<T>;

    if (eventIsNotRegistered) {
      eventObject.flag = event;
      eventObject.subject = new Subject<EventBusHandler<T>>();
      eventObject.latestArgs = [];
      this._eventsStorageMap.set(event, eventObject);
    }

    return this._eventsStorageMap.get(event);
  }
}
