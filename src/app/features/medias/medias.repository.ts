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
} from '../../core';
import { MediasService } from './medias.service';
import { Media } from './models';
import { isNullOrEmpty } from '../../utilities';

@Injectable()
export class MediasRepository extends McsRepositoryBase<Media> {

  /** Event that emits when notifications job changes */
  public notificationsChanged = new EventEmitter<any>();

  constructor(
    private _mediasApiService: MediasService,
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
    return this._mediasApiService.getMedias({
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
    return this._mediasApiService.getMedia(recordId)
      .pipe(
        map((response) => {
          this._updateMediaFromCache(response.content);
          return response;
        })
      );
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

  /**
   * Update the corresponding media based on cache data considering all
   * the current status of the media
   *
   * `@Note:` This is needed since the obtained media doesn't have yet the
   * local properties settings in which the basis of the media if it has
   * an on-going job.
   * @param record Record to be updated
   */
  private _updateMediaFromCache(record: Media): void {
    if (isNullOrEmpty(this.dataRecords)) { return; }

    let recordFound = this.dataRecords.find((media) => {
      return record.id === media.id;
    });
    if (isNullOrEmpty(recordFound)) { return; }
    record.isProcessing = recordFound.isProcessing;
    record.processingText = recordFound.processingText;
  }
}
