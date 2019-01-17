import { Injectable } from '@angular/core';
import { McsServerOperatingSystem } from '@app/models';
import { McsRepositoryBase } from '@app/core';
import { ServersApiService } from '../api-services/servers-api.service';
import { McsServersOsDataContext } from '../data-context/mcs-servers-os-data.context';

@Injectable()
export class McsServersOsRepository extends McsRepositoryBase<McsServerOperatingSystem> {

  constructor(_serversApiService: ServersApiService) {
    super(new McsServersOsDataContext(_serversApiService));
  }
}
