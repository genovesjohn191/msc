import { Injectable } from '@angular/core';
import { McsPortal } from '@app/models';
import { McsRepositoryBase } from '@app/core';
import { McsToolsDataContext } from '../data-context/mcs-tools-data.context';
import { ToolsApiService } from '../api-services/tools-api.service';

@Injectable()
export class McsToolsRepository extends McsRepositoryBase<McsPortal> {

  constructor(_toolsApiService: ToolsApiService) {
    super(new McsToolsDataContext(_toolsApiService));
  }
}
