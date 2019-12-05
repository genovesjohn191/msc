import { Injectable } from '@angular/core';
import { McsStorageBackUpAggregationTarget } from '@app/models';
import {
  McsApiClientFactory,
  McsApiStoragesFactory
} from '@app/api-client';
import { McsRepositoryBase } from '../core/mcs-repository.base';
import { McsStorageBackupAggregationTargetsDataContext } from '../data-context/mcs-storage-backup-aggregation-targets-data.context';

@Injectable()
export class McsStorageBackupAggregationTargetsRepository extends McsRepositoryBase<McsStorageBackUpAggregationTarget> {

  constructor(_apiClientFactory: McsApiClientFactory) {
    super(new McsStorageBackupAggregationTargetsDataContext(
      _apiClientFactory.getService(new McsApiStoragesFactory())
    ));
  }
}
