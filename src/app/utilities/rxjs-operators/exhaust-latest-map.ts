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

    let recentValue: T;

    source.subscribe(
      new OperatorSubscriber(
        subscriber,
        (outerValue) => {
          recentValue = outerValue;
          if (innerSub) { return; }

          innerSub = new OperatorSubscriber(subscriber, undefined, () => {
            if (recentValue && recentValue !== outerValue) {
              innerFrom(project(recentValue, index++)).subscribe(innerSub as any);
              recentValue = null;
              return;
            }

            innerSub = null;
            if (isComplete) { subscriber.complete(); }
          });

          innerFrom(project(outerValue, index++)).subscribe(innerSub as any);
        },
        () => {
          isComplete = true;
          if (!innerSub) { subscriber.complete(); }
        }
      )
    );
  });
}