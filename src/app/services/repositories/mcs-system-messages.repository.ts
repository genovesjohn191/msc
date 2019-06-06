import { Injectable } from '@angular/core';
import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsSystemMessage } from '@app/models';
import {
  McsApiClientFactory,
  McsApiSystemFactory
} from '@app/api-client';
import { McsSystemMessagesDataContext } from '../data-context/mcs-system-messages-data.context';

@Injectable()
export class McsSystemMessagesRepository extends McsRepositoryBase<McsSystemMessage> {
  constructor(_apiClientFactory: McsApiClientFactory) {
    super(new McsSystemMessagesDataContext(
      _apiClientFactory.getService(new McsApiSystemFactory())
    ));
  }
}
