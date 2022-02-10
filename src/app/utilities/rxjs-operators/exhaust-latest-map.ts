import {
  Observable,
  ObservableInput,
  OperatorFunction,
  Subscriber
} from 'rxjs';
import { innerFrom } from 'rxjs/internal/observable/innerFrom';
import { OperatorSubscriber } from 'rxjs/internal/operators/OperatorSubscriber';
import { operate } from 'rxjs/internal/util/lift';

// TODO(apascual): This is still under construction because emitLatestMap is deprecated
// See this difference between the code:
// Old - https://github.com/ReactiveX/rxjs/blob/6.x/src/internal/operators/exhaustMap.ts
// New - https://github.com/ReactiveX/rxjs/blob/master/src/internal/operators/exhaustMap.ts
export function exhaustLatestMap<T, O extends ObservableInput<any>>(
  project: (value: T, index: number) => Observable<O>,
): OperatorFunction<T, O> {
  return operate((source, subscriber) => {
    let index = 0;
    let innerSub: Subscriber<T> | null = null;
    let isComplete = false;

    let pendingItem: T;
    let activeItem: T;
    let hasPendingSubs: boolean;

    source.subscribe(
      new OperatorSubscriber(
        subscriber,
        (outerValue) => {
          if (!innerSub) {
            innerSub = new OperatorSubscriber(subscriber, undefined, () => {
              innerSub = null;
              if (isComplete) { subscriber.complete(); }
            });
            innerFrom(project(outerValue, index++))
              .subscribe(() => innerSub.next());
          }
        },
        () => {
          isComplete = true;
          if (!innerSub) { subscriber.complete(); }
        }
      )
    );
  });
}