import { Injectable } from '@angular/core';
import {
  McsApiClientFactory,
  McsApiNoticesFactory
} from '@app/api-client';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { McsNotice } from '@app/models';
import { compareDates } from '@app/utilities';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsNoticesDataContext } from '../data-context/mcs-notices.data.context';

@Injectable()
export class McsNoticesRepository extends McsRepositoryBase<McsNotice> {

  private _dispatcher: EventBusDispatcherService;

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsNoticesDataContext(_apiClientFactory.getService(new McsApiNoticesFactory())),
      _eventDispatcher,
      {
        dataChangeEvent: McsEvent.dataChangeNotices
      }
    );

    this._dispatcher = _eventDispatcher;
    this._registerEvents();
  }

  /**
   * Register the notice events
   */
  private _registerEvents(): void {
    this._dispatcher.addEventListener(McsEvent.noticeReceive, this._onNoticeReceive.bind(this));
  }

  /**
   * Event that emits when the notice has been received
   * @param notice notice received
   */
  private _onNoticeReceive(notice: McsNotice): void {
    this.addOrUpdate(notice);
    let sortPredicate = (firstRecord: McsNotice, secondRecord: McsNotice) => {
      return compareDates(secondRecord.createdOn, firstRecord.createdOn);
    };
    this.sortRecords(sortPredicate);
  }
}
