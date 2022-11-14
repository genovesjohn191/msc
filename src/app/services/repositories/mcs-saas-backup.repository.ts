import { Injectable } from '@angular/core';
import {
  McsApiClientFactory,
  McsApiSaasBackupFactory
} from '@app/api-client';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { McsStorageSaasBackup } from '@app/models';

import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsSaasBackupDataContext } from '../data-context/mcs-saas-backup-data.context';

@Injectable()
export class McsSaasBackupRepository extends McsRepositoryBase<McsStorageSaasBackup> {

  constructor(_apiClientFactory: McsApiClientFactory, _eventDispatcher: EventBusDispatcherService) {
    super(
      new McsSaasBackupDataContext(_apiClientFactory.getService(new McsApiSaasBackupFactory())),
      _eventDispatcher,
      {
        dataChangeEvent: McsEvent.dataChangeSaasBackup
      }
    );
  }
}
