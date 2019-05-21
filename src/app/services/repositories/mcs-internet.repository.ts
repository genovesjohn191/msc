import { Injectable } from '@angular/core';
import { McsInternetPort } from '@app/models';
import { McsRepositoryBase } from '@app/core';
import {
  McsApiClientFactory,
  McsApiInternetFactory
} from '@app/api-client';
import { McsInternetDataContext } from '../data-context/mcs-internet-data.context';

@Injectable()
export class McsInternetRepository extends McsRepositoryBase<McsInternetPort> {

  constructor(_apiClientFactory: McsApiClientFactory) {
    super(new McsInternetDataContext(
      _apiClientFactory.getService(new McsApiInternetFactory())
    ));
  }
}
