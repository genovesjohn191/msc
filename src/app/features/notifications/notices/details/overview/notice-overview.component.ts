import {
  Observable,
  Subject
} from 'rxjs';
import {
  shareReplay,
  takeUntil
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import { McsNotice } from '@app/models';
import {
  isNullOrUndefined,
  unsubscribeSafely
} from '@app/utilities';
import { NoticeDetailsService } from '../notice-details.component.service';


@Component({
  selector: 'mcs-notice-overview',
  templateUrl: './notice-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NoticeOverviewComponent implements OnInit, OnDestroy {
  public selectedNotice$: Observable<McsNotice>;
  private _destroySubject = new Subject<void>();

  public constructor(
    private _noticeDetailsService: NoticeDetailsService
  ) {
  }

  public ngOnInit(): void {
    this._subscribeToNoticeDetails();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public get timeZone(): string {
    let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if(isNullOrUndefined(timeZone) || !isNaN(+timeZone)){
      return 'Times displayed are in your local time zone.';
    }
    return 'Time Zone: ' + timeZone;
  }

  private _subscribeToNoticeDetails(): void {
    this.selectedNotice$ = this._noticeDetailsService.getNoticeDetails().pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );
  }
}
