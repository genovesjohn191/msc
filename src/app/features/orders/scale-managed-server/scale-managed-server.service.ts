import {
  Injectable,
  Injector
} from '@angular/core';
import { McsOrderBase } from '@app/core';
import { McsOrdersRepository } from '@app/services';
import { OrderIdType } from '@app/models';

@Injectable()
export class ScaleManagedServerService extends McsOrderBase {

  constructor(
    _injector: Injector,
    _ordersRepository: McsOrdersRepository,
  ) {
    super(_injector, _ordersRepository, OrderIdType.ScaleManageServer);
  }
}
