import { Injectable } from '@angular/core';
import { McsOrderBase } from '@app/core';
import { McsOrdersRepository } from '@app/services';
import { OrderIdType } from '@app/models';

@Injectable()
export class ExpandVdcStorageService extends McsOrderBase {

  constructor(_ordersRepository: McsOrdersRepository) {
    super(_ordersRepository, OrderIdType.ExpandVdcStorage);
  }
}
