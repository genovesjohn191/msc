import {
  Injectable,
  EventEmitter
} from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsRepositoryBase,
  McsApiSuccessResponse,
  McsNotificationEventsService
} from '../../../core';
import { MediaService } from '../media.service';
import { Media } from '../models';

@Injectable()
export class MediaRepository extends McsRepositoryBase<Media> {

  /** Event that emits when notifications job changes */
  public notificationsChanged = new EventEmitter<any>();

  constructor(
    private _mediaApiService: MediaService,
    private _notificationEvents: McsNotificationEventsService
  ) {
    super();
  }

  /**
   * This will be automatically called in the repoistory based class
   * to populate the data obtained
   */
  protected getAllRecords(
    pageIndex: number,
    pageSize: number,
    keyword: string
  ): Observable<McsApiSuccessResponse<Media[]>> {
    return this._mediaApiService.getMedias({
      page: pageIndex,
      perPage: pageSize,
      searchKeyword: keyword
    });
  }

  /**
   * This will be automatically called in the repository based class
   * to populate the data obtained using record id given when finding individual record
   * @param recordId Record id to find
   */
  protected getRecordById(recordId: string): Observable<McsApiSuccessResponse<Media>> {
    return this._mediaApiService.getMedia(recordId)
      .pipe(map((response) => response));
  }

  /**
   * This will be automatically called when data was obtained in getAllRecords or getRecordById
   *
   * `@Note:` We need to register the events after obtaining the data so that
   * we will get notified by the jobs when data is obtained
   */
  protected afterDataObtained(): void {
    this._notificationEvents.notifyNotificationsSubscribers();
  }
}
