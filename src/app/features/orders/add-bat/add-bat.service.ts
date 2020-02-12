import { Injectable } from '@angular/core';
import { McsOrderBase } from '@app/core';
import { OrderIdType } from '@app/models';
import { McsApiService } from '@app/services';

@Injectable()
export class AddBatService extends McsOrderBase {

  constructor(_apiService: McsApiService) {
    // TODO: Change the type of the BAT
    super(_apiService, OrderIdType.CreateAddOnServerBackup);
  }
}
