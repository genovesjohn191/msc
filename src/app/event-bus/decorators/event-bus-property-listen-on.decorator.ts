import { BehaviorSubject } from 'rxjs';
import {
  map,
  shareReplay
} from 'rxjs/operators';
import { EventBusDispatcherCore } from '../event-bus-dispatcher-core';
import { EventBusState } from '../event-bus-state';

/**
 * Subscribes to an event property based on the event name provided
 * @param event Event name on where to subcribe
 * @param destroy Flag that determines if the event should be automatically released
 */
export function EventBusPropertyListenOn<T>(event: EventBusState<T>) {
  return (target: any, name: string) => {
    let eventsService = EventBusDispatcherCore.getInstance();
    let decoratorSubject = new BehaviorSubject<any>({});

    let instanceFunc = function() {
      let eventObject = eventsService.getEvent(event);
      let eventSubject = eventObject.subject.pipe(
        map((response) => response || {})
      );

      eventSubject.subscribe(decoratorSubject);
      return decoratorSubject.pipe(shareReplay(1)) as BehaviorSubject<any>;
    };

    Object.defineProperty(target, name, {
      enumerable: true,
      configurable: true,
      writable: true,
      value: instanceFunc.call(this)
    });
  };
}
