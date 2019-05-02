import { Injectable } from '@angular/core';
import {
  Observable,
  BehaviorSubject,
  Subject,
  throwError,
} from 'rxjs';
import {
  distinctUntilChanged,
  tap,
  catchError
} from 'rxjs/operators';
import {
  IMcsFallible,
  IMcsStateChangeable,
  IMcsJobManager
} from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import { McsResourcesRepository } from '@app/services';
import {
  CatalogItemType,
  McsResource,
  McsResourceCatalogItemCreate,
  McsJob,
  McsApiSuccessResponse,
  McsValidation,
  DataStatus
} from '@app/models';

@Injectable()
export class MediaUploadService implements IMcsFallible, IMcsJobManager, IMcsStateChangeable {
  private _errorChange = new Subject<string[]>();
  private _stateChange = new Subject<DataStatus>();
  private _jobsChange = new Subject<McsJob[]>();

  /**
   * An observable event that emits when the selected resource has bee changed
   */
  public get selectedResourceChange(): Observable<McsResource> {
    return this._selectedResourceChange.pipe(distinctUntilChanged());
  }
  private _selectedResourceChange: BehaviorSubject<McsResource>;

  constructor(private _resourcesRepository: McsResourcesRepository) {
    this._selectedResourceChange = new BehaviorSubject(undefined);
  }

  /**
   * An observable method that returns true when the url exist
   * @param resourceId Resource ID where the items would be checked
   * @param _url Url to validate
   */
  public validateUrl(resourceId: string, _url: string): Observable<McsApiSuccessResponse<McsValidation[]>> {
    let fieldDetails = new McsResourceCatalogItemCreate();
    fieldDetails.name = 'dummy-url-name';
    fieldDetails.description = 'dummy-description';
    fieldDetails.type = CatalogItemType.Media;
    fieldDetails.url = _url;
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
   * @param catalogId Catalog ID where the media would be attached
   * @param createDetails Creation details of the media to be provided
   */
  public uploadMedia(resourceId: string, catalogId: string, createDetails: McsResourceCatalogItemCreate) {
    this.setChangeState(DataStatus.InProgress);
    return this._resourcesRepository.createResourceCatalogItem(resourceId, catalogId, createDetails)
      .pipe(
        tap((response) => {
          this.setChangeState(DataStatus.Success);
          this.setJobs(response);
        }),
        catchError((httpError) => {
          this.setChangeState(DataStatus.Error);
          this.setErrors(...httpError.errorMessages);
          return throwError(httpError);
        })
      );
  }

  /**
   * Event that emits when job has been changed
   */
  public jobsChange(): Observable<McsJob[]> {
    return this._jobsChange.asObservable();
  }

  /**
   * Event that emits when state has been changed
   */
  public stateChange(): Observable<DataStatus> {
    return this._stateChange.asObservable();
  }

  /**
   * Event that emits when error has been changed
   */
  public errorsChange(): Observable<string[]> {
    return this._errorChange.asObservable();
  }

  /**
   * Sets the error to the event
   * @param errorMessages Error messages to be emitted
   */
  public setErrors(...errors: string[]): void {
    this._errorChange.next(errors);
  }

  /**
   * Sets the change state to the event
   * @param dataStatus Data status to be emitted
   */
  public setChangeState(state: DataStatus): void {
    this._stateChange.next(state);
  }

  /**
   * Sets the jobs to the event
   * @param jobs Jobs to be emitted
   */
  public setJobs(...jobs: McsJob[]): void {
    this._jobsChange.next(jobs);
  }
}
