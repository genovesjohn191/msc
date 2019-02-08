import {
  Subscription,
  Subject
} from 'rxjs';
import {
  isNullOrUndefined,
  isNullOrEmpty
} from '@app/utilities';
import { EventBusState } from './event-bus-state.enum';

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
  private _eventsStorageMap = new Map<EventBusState, EventBusObject<any>>();

  private constructor() { }

  /**
   * Attaches a new event handler to the provided event name
   * @param event Event name to where the handler will be attached
   * @param callback Event handler callback to be called when the event emitted
   */
  public addEventListener(event: EventBusState, callback: (...args: any[]) => void): Subscription {
    let eventObject = this._getEventObjectFromCache<any>(event);
    return eventObject.subject.subscribe((eventArg) => {
      callback.apply(this, eventArg.params);
    });
  }

  /**
   * Dispatches an event based on the event name provided and emit the provided arguments
   * @param event Event name of the event to dispatch
   * @param args Arguments to be dispatched on the event
   */
  public dispatch<T>(event: EventBusState, ...args: T[]): void {
    let eventObject = this._getEventObjectFromCache(event);
    eventObject.latestArgs = isNullOrEmpty(args) ? eventObject.latestArgs : args;
    eventObject.subject.next({ params: eventObject.latestArgs });
  }

  /**
   * Get the actual event instance
   * @param event Event to be obtained
   */
  public getEvent<T>(event: EventBusState): EventBusObject<T> {
    return this._getEventObjectFromCache<any>(event);
  }

  /**
   * Cache all the event objects
   * @param event Event name to be registered in the cache
   */
  private _getEventObjectFromCache<T>(event: EventBusState): EventBusObject<T> {
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
