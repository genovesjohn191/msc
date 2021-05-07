import { Injector } from '@angular/core';
import { McsTerraformDeployment } from '@app/models';
import { McsTerraformDeploymentsRepository } from '@app/services/repositories/mcs-terraform-deployments.repository';

import { McsEntityStateManagerBase } from '../base/mcs-entity-state-manager.base';

export class McsTerraformDeploymentStateManager extends McsEntityStateManagerBase<McsTerraformDeployment> {

  constructor(_injector: Injector) {
    super(_injector, McsTerraformDeploymentsRepository);
  }
}
