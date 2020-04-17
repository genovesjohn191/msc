import { Injectable } from '@angular/core';
import { McsBackUpAggregationTarget } from '@app/models';
import {
  McsApiClientFactory,
  McsApiStoragesFactory
} from '@app/api-client';
import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsBackupAggregationTargetsDataContext } from '../data-context/mcs-backup-aggregation-targets-data.context';

@Injectable()
export class McsBackupAggregationTargetsRepository extends McsRepositoryBase<McsBackUpAggregationTarget> {

  constructor(_apiClientFactory: McsApiClientFactory) {
    super(new McsBackupAggregationTargetsDataContext(
      _apiClientFactory.getService(new McsApiStoragesFactory())
    ));
  }
}
