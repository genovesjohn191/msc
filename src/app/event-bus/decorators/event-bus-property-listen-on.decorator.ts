import { BehaviorSubject } from 'rxjs';
import {
  map,
  shareReplay
} from 'rxjs/operators';

import { EventBusDispatcherCore } from '../event-bus-dispatcher-core';
import { EventBusState } from '../event-bus-state';

export function EventBusPropertyListenOn<T>(event: EventBusState<T>) {
  return (target: any, name: string) => {
    let eventsService = EventBusDispatcherCore.getInstance();
    let decoratorSubject = new BehaviorSubject<any>({});

    let instanceFunc = () => {
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
