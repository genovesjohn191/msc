import {
  Injectable,
  NgZone
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { merge } from 'rxjs/observable/merge';
import { auditTime } from 'rxjs/operators/auditTime';
import { of as observableOf } from 'rxjs/observable/of';
import { McsPlatformService } from './mcs-platform.service';

// Constants
const DEFAULT_RESIZE_TIME = 20;

@Injectable()
export class McsViewportService {

  /** Stream of viewport change events. */
  private _change: Observable<Event>;

  constructor(
    private _ngZone: NgZone,
    private _platformService: McsPlatformService
  ) {
    this._change = this._platformService.isBrowser ? this._ngZone.runOutsideAngular(() => {
      return merge<Event>(fromEvent(window, 'resize'), fromEvent(window, 'orientationchange'));
    }) : observableOf();
  }

  /**
   * Returns a stream that emits whenever the size of the viewport changes.
   * @param throttle Time in milliseconds to throttle the stream.
   */
  public change(throttleTime: number = DEFAULT_RESIZE_TIME): Observable<Event> {
    return throttleTime > 0 ? this._change.pipe(auditTime(throttleTime)) : this._change;
  }
}
