import { Injectable } from '@angular/core';
import {
  Observable,
  BehaviorSubject,
} from 'rxjs';
import {
  distinctUntilChanged,
  tap
} from 'rxjs/operators';
import { McsResourcesRepository } from '@app/services';
import { isNullOrEmpty } from '@app/utilities';
import {
  CatalogItemType,
  McsResource,
  McsResourceCatalogItemCreate,
  McsJob,
  McsApiSuccessResponse,
  McsValidation
} from '@app/models';

@Injectable()
export class MediaUploadService {

  /**
   * An observable event that emits when the selected resource has bee changed
   */
  public get selectedResourceChange(): Observable<McsResource> {
    return this._selectedResourceChange.pipe(distinctUntilChanged());
  }
  private _selectedResourceChange: BehaviorSubject<McsResource>;

  /**
   * An observable event that emits whenever there are changes on the job
   */
  public get jobChanges(): Observable<McsJob> {
    return this._jobChanges.pipe(distinctUntilChanged());
  }
  private _jobChanges: BehaviorSubject<McsJob>;

  constructor(private _resourcesRepository: McsResourcesRepository) {
    this._jobChanges = new BehaviorSubject(undefined);
    this._selectedResourceChange = new BehaviorSubject(undefined);
  }

  /**
   * An observable method that returns true when the url exist
   * @param resourceId Resource ID where the items would be checked
   * @param _url Url to validate
   */
  public validateUrl(resourceId: string, _url: string):
    Observable<McsApiSuccessResponse<McsValidation[]>> {
    let fieldDetails = {
      name: 'dummy-url-name',
      catalogName: 'dummy-catalog-name',
      type: CatalogItemType.Media,
      url: _url
    } as McsResourceCatalogItemCreate;
    return this._resourcesRepository.validateCatalogItems(resourceId, fieldDetails);
  }

  /**
   * Sets the selected resource
   * @param resource Resource to be selected
   */
  public setSelectedResource(resource: McsResource): void {
    if (isNullOrEmpty(resource)) { return; }
    this._selectedResourceChange.next(resource);
  }

  /**
   * An observable method that sends a request to API for uploading media
   * @param resourceId Resource ID where the media would be uploaded
   * @param createDetails Creation details of the media to be provided
   */
  public uploadMedia(resourceId: string, createDetails: McsResourceCatalogItemCreate) {
    return this._resourcesRepository.createResourceCatalogItem(resourceId, createDetails)
      .pipe(
        tap((response) => this._jobChanges.next(response))
      );
  }
}
