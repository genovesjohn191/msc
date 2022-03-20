import {
  asyncScheduler,
  MonoTypeOperatorFunction,
  SchedulerLike
} from 'rxjs';

import { debounceTimeAfter } from './debounce-time-after';

export function debounceTimeAfterFirst<T>(
  dueTime: number,
  scheduler: SchedulerLike = asyncScheduler,
): MonoTypeOperatorFunction<T> {
  return debounceTimeAfter(1, dueTime, scheduler);
}
