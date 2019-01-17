import { Injectable } from '@angular/core';
import { McsConsole } from '@app/models';
import { McsRepositoryBase } from '@app/core';
import { McsConsoleDataContext } from '../data-context/mcs-console-data.context';
import { ConsoleApiService } from '../api-services/console-api.service';

@Injectable()
export class McsConsoleRepository extends McsRepositoryBase<McsConsole> {

  constructor(_consoleApiService: ConsoleApiService) {
    super(new McsConsoleDataContext(_consoleApiService));
  }
}
