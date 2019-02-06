import {
  map,
  shareReplay,
  startWith
} from 'rxjs/operators';
import { getSafeProperty } from '@app/utilities';
import { EventBusItem } from '../event-bus-item.enum';
import { EventBusDispatcherCore } from '../event-bus-dispatcher-core';

/**
 * Subscribes to an event property based on the event name provided
 * @param event Event name on where to subcribe
 * @param destroy Flag that determines if the event should be automatically released
 */
export function EventBusPropertyListenOn(event: EventBusItem) {
  return (target: any, name: string) => {
    let eventsService = EventBusDispatcherCore.getInstance();

    let instanceFunc = function() {
      let eventObject = eventsService.getEvent(event);

      return eventObject.subject.pipe(
        startWith(null),
        map((response) => getSafeProperty(response, (obj) => obj.params[0][0], {})),
        shareReplay(1)
      );
    };

    Object.defineProperty(target, name, {
      enumerable: true,
      configurable: true,
      writable: true,
      value: instanceFunc.apply(this)
    });
  };
}
