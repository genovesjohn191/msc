import { BehaviorSubject } from 'rxjs';
import {
  map,
  shareReplay
} from 'rxjs/operators';
import { getSafeProperty } from '@app/utilities';
import { EventBusState } from '../event-bus-state.enum';
import { EventBusDispatcherCore } from '../event-bus-dispatcher-core';

/**
 * Subscribes to an event property based on the event name provided
 * @param event Event name on where to subcribe
 * @param destroy Flag that determines if the event should be automatically released
 */
export function EventBusPropertyListenOn(event: EventBusState) {
  return (target: any, name: string) => {
    let eventsService = EventBusDispatcherCore.getInstance();

    let instanceFunc = function() {
      let eventObject = eventsService.getEvent(event);
      let eventSubject = eventObject.subject.pipe(
        map((response) => getSafeProperty(response, (obj) => obj.params[0][0], {})),
        shareReplay(1)
      );

      let decoratorSubject = new BehaviorSubject<any>({});
      eventSubject.subscribe((response) => decoratorSubject.next(response));
      return decoratorSubject;
    };

    Object.defineProperty(target, name, {
      enumerable: true,
      configurable: true,
      writable: true,
      value: instanceFunc.apply(this)
    });
  };
}
