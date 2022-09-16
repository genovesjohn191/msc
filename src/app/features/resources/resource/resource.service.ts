import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { McsResource } from '@app/models';

@Injectable()
export class ResourceService {
  private _resourceId: string;
  private _resourceDetailsChange = new BehaviorSubject<McsResource>(null);

  /**
   * Returns the resource details of the VDC
   */
  public getResourceDetails(): Observable<McsResource> {
    return this._resourceDetailsChange.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  /**
   * Sets the resource details
   * @param resource Resource details to be set
   */
  public setResourceDetails(resource: McsResource): void {
    this._resourceDetailsChange.next(resource);
  }

  /**
   * Sets the resource id of the resource
   */
  public setResourceId(resourceId: string): void {
    this._resourceId = resourceId;
  }

  /**
   * Gets the resource id
   */
  public getResourceId(): string {
    return this._resourceId;
  }
}
