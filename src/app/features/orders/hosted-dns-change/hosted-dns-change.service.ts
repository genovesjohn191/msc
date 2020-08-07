import { Injectable } from '@angular/core';
import { McsOrderBase } from '@app/core';
import { McsApiService } from '@app/services';
import { OrderIdType } from '@app/models';

@Injectable()
export class HostedDnsChangeService extends McsOrderBase {

  constructor(_apiService: McsApiService) {
    super(_apiService, OrderIdType.HostedDnsChange);
  }
}
