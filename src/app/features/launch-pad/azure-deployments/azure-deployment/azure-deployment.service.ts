import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { McsTerraformDeployment } from '@app/models';

@Injectable()
export class AzureDeploymentService {
  private _deploymentDetails = new BehaviorSubject<McsTerraformDeployment>(null);

  public getDeploymentDetails(): Observable<McsTerraformDeployment> {
    return this._deploymentDetails.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  public setDeploymentDetails(param: McsTerraformDeployment): void {
    this._deploymentDetails.next(param);
  }
}
