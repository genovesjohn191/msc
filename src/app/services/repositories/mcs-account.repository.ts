import { Injectable } from '@angular/core';
import {
McsApiClientFactory,
McsApiAccountFactory
} from '@app/api-client';
import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsAccount } from '@app/models';
import { McsAccountDataContext } from '../data-context/mcs-account-data.context';

@Injectable()
export class McsAccountRepository extends McsRepositoryBase<McsAccount> {

  constructor(_apiClientFactory: McsApiClientFactory) {
    super(new McsAccountDataContext(
      _apiClientFactory.getService(new McsApiAccountFactory())
    ));
  }
}
