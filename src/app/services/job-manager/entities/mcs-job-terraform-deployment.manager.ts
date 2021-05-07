import { Injector } from '@angular/core';
import { EventBusDispatcherService } from '@app/event-bus';
import {
  ActionStatus,
  EntityRequester,
  McsTerraformDeployment
} from '@app/models';
import { McsTerraformDeploymentsRepository } from '@app/services/repositories/mcs-terraform-deployments.repository';

import { McsJobEntityBase } from '../base/mcs-job-entity.base';

export class McsJobTerraformDeploymentManager extends McsJobEntityBase<McsTerraformDeployment> {

  constructor(
    _actionStatus: ActionStatus,
    _injector: Injector,
    private _customJobReferenceId?: string
  ) {
    super(
      EntityRequester.TerraformDeployment,
      _injector.get(McsTerraformDeploymentsRepository),
      _actionStatus,
      _injector.get(EventBusDispatcherService)
    );
  }

  protected getJobReferenceId(): string {
    return this._customJobReferenceId || 'terraformDeploymentId';
  }
}
