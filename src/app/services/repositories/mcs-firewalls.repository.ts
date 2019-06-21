import { Injectable } from '@angular/core';
import { McsFirewall } from '@app/models';
import {
  McsApiClientFactory,
  McsApiFirewallsFactory
} from '@app/api-client';
import { McsFirewallsDataContext } from '../data-context/mcs-firewalls-data.context';
import { McsRepositoryBase } from '../core/mcs-repository.base';

@Injectable()
export class McsFirewallsRepository extends McsRepositoryBase<McsFirewall> {

  constructor(_apiClientFactory: McsApiClientFactory) {
    super(new McsFirewallsDataContext(
      _apiClientFactory.getService(new McsApiFirewallsFactory())
    ));
  }
}
