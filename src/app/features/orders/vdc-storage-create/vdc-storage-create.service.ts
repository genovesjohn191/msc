import { Injectable } from '@angular/core';
import { McsOrderBase } from '@app/core';
import { OrderIdType } from '@app/models';
import { McsApiService } from '@app/services';

@Injectable()
export class VdcStorageCreateService extends McsOrderBase {

  constructor(_apiService: McsApiService) {
    super(_apiService, OrderIdType.VdcStorageCreate);
  }
}
