import {
  Subject,
  Subscription
} from 'rxjs';

import { EventBusState } from './event-bus-state';

export interface EventBusObject<T> {
  flag?: EventBusState<T>;
  latestPayload?: T;
  subject?: Subject<T>;
}

export class EventBusDispatcherCore {
  private static _eventDispatcherInstance: EventBusDispatcherCore = null;
  private _eventsStorageMap = new Map<string, EventBusObject<any>>();

  public static getInstance(): EventBusDispatcherCore {
    if (!this._eventDispatcherInstance) {
      this._eventDispatcherInstance = new EventBusDispatcherCore();
    }
    return this._eventDispatcherInstance;
  }

  private constructor() { }

  public addEventListener<T>(event: EventBusState<T>, callback: (args: T) => void): Subscription {
    const eventObject = this._getEventObjectFromCache<any>(event);
    return eventObject.subject.subscribe((eventArg) => {
      callback.call(this, eventArg);
    });
  }

  public dispatch<T>(event: EventBusState<T>, payload: T): void {
    const eventObject = this._getEventObjectFromCache(event);
    eventObject.latestPayload = !payload ? eventObject.latestPayload : payload;
    eventObject.subject.next(eventObject.latestPayload);
  }

  public getEvent<T>(event: EventBusState<T>): EventBusObject<T> {
    return this._getEventObjectFromCache<any>(event);
  }

  private _getEventObjectFromCache<T>(event: EventBusState<T>): EventBusObject<T> {
    const eventIsNotRegistered = !this._eventsStorageMap.has(event.eventName);
    const eventObject = {} as EventBusObject<T>;

    if (eventIsNotRegistered) {
      eventObject.flag = event;
      eventObject.subject = new Subject<T>();
      eventObject.latestPayload = null;
      this._eventsStorageMap.set(event.eventName, eventObject);
    }
    return this._eventsStorageMap.get(event.eventName);
  }
}
