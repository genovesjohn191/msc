import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiCloudHealthAlertService } from '../interfaces/mcs-api-cloudhealth-alert.interface';
import { McsApiCloudHealthAlertService } from '../services/mcs-api-cloudhealth-alert.service';

export class McsApiCloudHealthAlertFactory extends McsApiEntityFactory<IMcsApiCloudHealthAlertService> {
  constructor() {
    super(McsApiCloudHealthAlertService);
  }
}
