import { Injectable } from '@angular/core';
import {
  Router,
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { ServersResourcesRespository } from '../servers-resources.repository';

@Injectable()
export class CreateSelfManagedServerResolver implements Resolve<any> {

  constructor(
    private _router: Router,
    private _serversResourcesRepository: ServersResourcesRespository
  ) { }

  /**
   * Resolver for the create server in order for us to check
   * if the resources has self-managed server, otherwise it
   * will navigate to servers listing
   * @param _activatedRoute Activated route
   * @param _state State of the routes
   */
  public resolve(
    _activatedRoute: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    return this._serversResourcesRepository
      .hasSelfManagedServer()
      .map((_hasSelfManaged) => {
        if (!_hasSelfManaged) {
          this._router.navigate(['./servers']);
          return false;
        }
        return true;
      });
  }
}
