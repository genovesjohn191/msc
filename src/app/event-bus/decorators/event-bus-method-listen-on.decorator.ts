import { EventBusDispatcherCore } from '../event-bus-dispatcher-core';
import { EventBusState } from '../event-bus-state';

/**
 * Subscribes to an event method based on the event name provided
 * @param event Event name on where to listen
 * @param destroy Flag that determines if the event should be automatically released
 */
export function EventBusMethodListenOn<T>(event: EventBusState<T>, destroy: boolean = false) {
  return (target: any, _name: string, descriptor: PropertyDescriptor) => {
    let eventsService = EventBusDispatcherCore.getInstance();
    let originalMethod = descriptor.value;

    let instanceFunc = function() {
      let eventSubscription = eventsService.getEvent(event)
        .subject.subscribe((args) => {
          originalMethod.apply(this, args);
        });

      // Execute auto release of memory to prevent memory leak
      if (destroy) {
        let oldNgOnDestroy = target.ngOnDestroy;

        target.ngOnDestroy = () => {
          if (!oldNgOnDestroy) { oldNgOnDestroy.call(this); }
          eventSubscription.unsubscribe();
        };
      }
    };

    // Warn users when use inside of component
    let className: string = target.constructor.name;
    if (className.includes('Component')) {
      throw new Error(`Eventbus listener decorator
        could not be implemented inside a component class.`);
    }
    descriptor.value = instanceFunc.bind(this);
    descriptor.value.call(this);
    return descriptor;
  };
}
