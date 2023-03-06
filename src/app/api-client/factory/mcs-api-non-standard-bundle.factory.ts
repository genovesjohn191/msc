import { McsApiEntityFactory } from './mcs-api-entity.factory';
import { IMcsApiNonStandardBundlesService } from '../interfaces/mcs-api-non-standard-bundles.interface';
import { McsApiNonStandardBundlesService } from '../services/mcs-api-non-standard-bundles.services';

export class McsApiNonStandardBundleFactory extends McsApiEntityFactory<IMcsApiNonStandardBundlesService> {
  constructor() {
    super(McsApiNonStandardBundlesService);
  }
}