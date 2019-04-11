import { Injectable } from '@angular/core';
import { McsOrderBase } from '@app/core';
import { McsOrdersRepository } from '@app/services';

@Injectable()
export class ScaleManagedServerService extends McsOrderBase {

  constructor(_ordersRepository: McsOrdersRepository) {
    super(_ordersRepository);
  }
}
