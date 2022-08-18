import {
  BehaviorSubject,
  Observable,
  Subscription,
  timer
} from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Injectable } from '@angular/core';

import { McsNotice } from '@app/models';
import { McsApiService } from '@app/services';
import { McsDisposable } from '@app/utilities';

/**
 * MCS notification notice service
 * Serves as the main context of the notice and it will
 * get notified when there are new notices that are unacknowledged
 */
@Injectable()
export class McsNotificationNoticeService implements McsDisposable {
  private _noticeStream = new BehaviorSubject<McsNotice[]>(null);
  private _unacknowledgedNotices: Subscription;
  private _notices: McsNotice[] = [];

  constructor(private _apiService: McsApiService) { }

  public dispose() {
    this._unacknowledgedNotices.unsubscribe();
  }
  
  /**
   * Poll for unacknowledged notices every 30 seconds
   */
  public getAllUnacknowledgedNotices(): void {
    this._unacknowledgedNotices = timer(0, 30000).pipe(
      switchMap(() => this._apiService.getNotices())
    ).subscribe((notices) => {
      this._notices = notices.collection?.filter((item) => !item.acknowledged) || [];
      this._noticeStream.next(this._notices);
    });
  }

  public updateAcknowledgedNotice(selectedNotice: McsNotice): void {
    let selectedNoticeIndex = this._notices.findIndex((obj => obj.id === selectedNotice.id));
    this._notices[selectedNoticeIndex].acknowledged = true;
    this._noticeStream.next(this._notices);
  }

  /**
   * An observable event that emits when notices has been changed
   */
  public noticesChange(): Observable<McsNotice[]> {
    return this._noticeStream.asObservable();
  }
}
