import {
  concat,
  MonoTypeOperatorFunction,
  SchedulerLike
} from 'rxjs';
import { asyncScheduler } from 'rxjs/internal/scheduler/async';
import {
  connect,
  debounceTime,
  take
} from 'rxjs/operators';

export function debounceTimeAfter<T>(
  amount: number,
  dueTime: number,
  scheduler: SchedulerLike = asyncScheduler,
): MonoTypeOperatorFunction<T> {
  return connect(value =>
    concat(
      value.pipe(take(amount)),
      value.pipe(debounceTime(dueTime, scheduler))
    )
  );
}
