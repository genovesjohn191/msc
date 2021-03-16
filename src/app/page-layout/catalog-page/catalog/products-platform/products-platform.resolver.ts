import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import {
  catchError,
  map
} from 'rxjs/operators';
import {
  McsApiErrorContext,
  McsCatalogProductPlatform
} from '@app/models';
import { McsApiService } from '@app/services';
import { getSafeProperty, isNullOrEmpty } from '@app/utilities';

@Injectable()
export class ProductsPlatformResolver implements Resolve<McsCatalogProductPlatform> {

  constructor(private _apiService: McsApiService) { }

  public resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<any> {
    let platformId = route.paramMap.get('id');

    return this._apiService.getCatalogProducts().pipe(
      map((response) => {
        let platforms = getSafeProperty(response, (obj) => obj.platforms) || [];

        if (isNullOrEmpty(platformId)) {
          return platforms.find((platform) => !isNullOrEmpty(platform.families));
        }

        let foundPlatform = platforms.find((platform) => platform.id === platformId);
        return foundPlatform;
      }),
      catchError((error) => McsApiErrorContext.throwPrimaryError(error))
    );
  }
}
