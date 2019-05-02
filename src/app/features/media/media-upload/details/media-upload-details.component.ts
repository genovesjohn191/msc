import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ElementRef,
  ViewChild
} from '@angular/core';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import {
  Subject,
  throwError,
  Observable,
  of
} from 'rxjs';
import {
  catchError,
  tap,
  finalize,
  shareReplay
} from 'rxjs/operators';
import { EventBusDispatcherService } from '@app/event-bus';
import {
  CoreValidators,
  CoreDefinition,
  McsErrorHandlerService,
  McsFormGroupService,
  CoreRoutes,
  CoreEvent,
  IMcsNavigateAwayGuard
} from '@app/core';
import {
  unsubscribeSafely,
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';
import { McsResourcesRepository } from '@app/services';
import {
  McsResource,
  McsResourceCatalogItemCreate,
  CatalogItemType,
  RouteKey,
  McsApiErrorResponse,
  McsResourceCatalog
} from '@app/models';
import { McsFormGroupDirective } from '@app/shared';
import { MediaUploadService } from '../media-upload.service';

@Component({
  selector: 'mcs-media-upload-details',
  templateUrl: 'media-upload-details.component.html'
})

export class MediaUploadDetailsComponent
  implements OnInit, OnDestroy, IMcsNavigateAwayGuard {

  public resources$: Observable<McsResource[]>;
  public resourceCatalogs$: Observable<McsResourceCatalog[]>;
  public selectedResource$: Observable<McsResource>;
  public selectedResourceId: string;

  public urlInfoMessage: string;
  public mediaExtensions$: Observable<string[]>;

  // Form variables
  public fgMediaUpload: FormGroup;
  public fcResources: FormControl;
  public fcCatalogs: FormControl;
  public fcMediaName: FormControl;
  public fcMediaUrl: FormControl;
  public fcMediaExtension: FormControl;
  public fcMediaDescription: FormControl;

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;
  private _destroySubject = new Subject<void>();

  private _mediaUrlStatusIconKey: string;
  public get mediaUrlStatusIconKey(): string { return this._mediaUrlStatusIconKey; }
  public set mediaUrlStatusIconKey(value: string) {
    this._mediaUrlStatusIconKey = value;
    this._changeDetectorRef.markForCheck();
  }

  constructor(
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _formGroupService: McsFormGroupService,
    private _errorHandlerService: McsErrorHandlerService,
    private _resourcesRepository: McsResourcesRepository,
    private _mediaUploadService: MediaUploadService
  ) { }

  public ngOnInit() {
    this._registerFormGroup();
    this._subscribeToResourcesDataChange();
    this._subsribeToResources();
    this._subscribeToMediaExtensions();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * Returns true when all forms are valid
   */
  public get allFormsAreValid(): boolean {
    return getSafeProperty(this.fgMediaUpload, (obj) => obj.valid);
  }

  /**
   * Event that emits when navigating away from this component page
   */
  public canNavigateAway(): boolean {
    return !this._formGroup.hasDirtyFormControls();
  }

  /**
   * Event that emits whenever a resource has been change
   */
  public onChangeResource(resource: McsResource): void {
    if (isNullOrEmpty(resource)) { return; }
    // this.selectedResourceId = resource.id;
    this._subscribeToResourceCatalogs(resource.id);
  }

  /**
   * Event that emits when the media url textbox has lost focused
   */
  public onBlurMediaUrl(): void {
    if (this.fcMediaUrl.hasError('url')) { return; }
    this.fcMediaUrl.markAsPending();
    this.mediaUrlStatusIconKey = CoreDefinition.ASSETS_GIF_LOADER_ELLIPSIS;
    let mediaUrl = this.fcMediaUrl.value;

    let selectedResource: McsResource = this.fcResources.value;

    this._mediaUploadService.validateUrl(
      selectedResource.id,
      mediaUrl
    ).pipe(
      catchError((_httpError: McsApiErrorResponse) => {
        if (isNullOrEmpty(_httpError)) { return throwError(_httpError); }
        this.mediaUrlStatusIconKey = CoreDefinition.ASSETS_SVG_ERROR;
        this.urlInfoMessage = getSafeProperty(_httpError, (obj) => obj.errorMessages[0]);
        this.fcMediaUrl.setErrors({ urlValidationError: true });
        return throwError(_httpError);
      })
    ).subscribe((response) => {
      this.fcMediaUrl.updateValueAndValidity();
      this.mediaUrlStatusIconKey = CoreDefinition.ASSETS_SVG_SUCCESS;
      this.urlInfoMessage = getSafeProperty(response, (obj) => obj.content[0].message);
    });
  }

  /**
   * Event that emits when the form will be submitted
   */
  public onSubmitMediaUpload(): void {
    if (!this._validateFormFields()) { return; }

    let selectedResource: McsResource = this.fcResources.value;
    let selectedCatalog: McsResourceCatalog = this.fcCatalogs.value;

    let uploadMediaModel = new McsResourceCatalogItemCreate();
    uploadMediaModel.name = this.fcMediaName.value + this.fcMediaExtension.value;
    uploadMediaModel.url = this.fcMediaUrl.value;
    uploadMediaModel.description = this.fcMediaDescription.value;
    uploadMediaModel.type = CatalogItemType.Media;
    uploadMediaModel.clientReferenceObject = {
      resourcePath: CoreRoutes.getNavigationPath(RouteKey.Medium)
    };

    this._mediaUploadService.uploadMedia(
      selectedResource.id,
      selectedCatalog.id,
      uploadMediaModel
    ).pipe(
      catchError((httpError) => {
        this._mediaUploadService.setErrors(httpError.errorMessages);
        return throwError(httpError);
      }),
      finalize(() => this._changeDetectorRef.markForCheck())
    ).subscribe();
  }

  /**
   * Subscribes to media extensions
   */
  private _subscribeToMediaExtensions(): void {
    this.mediaExtensions$ = of(['.iso', '.ovf']);
  }

  /**
   * Subscribes to all the resources on the repository
   */
  private _subsribeToResources(): void {
    this._eventDispatcher.dispatch(CoreEvent.loaderShow);

    this.resources$ = this._resourcesRepository.getAll().pipe(
      catchError((error) => {
        this._errorHandlerService.redirectToErrorPage(error.status);
        return throwError(error);
      })
    );
  }

  private _subscribeToResourceCatalogs(resourceId: string): void {
    if (isNullOrEmpty(resourceId)) { return; }
    this._eventDispatcher.dispatch(CoreEvent.loaderShow);

    this.resourceCatalogs$ = this._resourcesRepository.getResourceCatalogs(resourceId).pipe(
      shareReplay(1),
      tap(() => this._resetFormFields()),
      finalize(() => this._eventDispatcher.dispatch(CoreEvent.loaderHide))
    );
  }

  /**
   * Registers the form group including its form fields
   */
  private _registerFormGroup(): void {
    // Register Form Controls
    this.fcResources = new FormControl('', [
      CoreValidators.required
    ]);

    this.fcCatalogs = new FormControl('', [
      CoreValidators.required
    ]);

    this.fcMediaName = new FormControl('', [
      CoreValidators.required,
      CoreValidators.custom(
        this._validateMediaName.bind(this),
        'mediaNameInvalid'
      )
    ]);

    this.fcMediaExtension = new FormControl('', [
      CoreValidators.required
    ]);
    this.fcMediaUrl = new FormControl('', [
      CoreValidators.required,
      CoreValidators.url
    ]);
    this.fcMediaUrl.valueChanges.subscribe(() => {
      this.mediaUrlStatusIconKey = undefined;
      this.urlInfoMessage = undefined;
    });
    this.fcMediaDescription = new FormControl('', []);

    // Register Form Groups using binding
    this.fgMediaUpload = new FormGroup({
      fcResources: this.fcResources,
      fcCatalogs: this.fcCatalogs,
      fcMediaName: this.fcMediaName,
      fcMediaUrl: this.fcMediaUrl,
      fcMediaExtension: this.fcMediaExtension,
      fcMediaDescription: this.fcMediaDescription
    });
  }

  /**
   * Returns true when media name is valid
   * @param inputValue Inputted value from input box
   */
  private _validateMediaName(inputValue: any): boolean {
    return CoreDefinition.REGEX_MEDIA_NAME_PATTERN.test(inputValue);
  }

  /**
   * Validates the form fields in all existing form groups
   */
  private _validateFormFields(): boolean {
    if (this.allFormsAreValid) { return true; }
    this._formGroupService.touchAllFormFields(this.fgMediaUpload);
    this._formGroupService.scrollToFirstInvalidField(this._elementRef.nativeElement);
    return false;
  }

  /**
   * Subscribes to resources data change on the repository
   */
  private _subscribeToResourcesDataChange(): void {
    this._resourcesRepository.dataChange().subscribe(() => {
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Resets all form fields data
   */
  private _resetFormFields(): void {
    if (isNullOrEmpty(this.fgMediaUpload)) { return; }
    this.fcCatalogs.reset();
    this.fcMediaDescription.reset();
    this.fcMediaName.reset();
    this.fcMediaUrl.reset();
  }
}
