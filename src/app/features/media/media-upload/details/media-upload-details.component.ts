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
  BehaviorSubject,
  throwError,
  Observable
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
  CoreEvent
} from '@app/core';
import {
  unsubscribeSafely,
  isNullOrEmpty,
  McsSafeToNavigateAway,
  getSafeProperty,
  getUniqueRecords
} from '@app/utilities';
import { McsResourcesRepository } from '@app/services';
import {
  McsResource,
  McsResourceCatalogItemCreate,
  CatalogItemType,
  McsResourceCatalogItem,
  RouteKey,
  McsApiErrorResponse
} from '@app/models';
import { McsFormGroupDirective } from '@app/shared';
import { MediaUploadService } from '../media-upload.service';

const MEDIA_URL_EXTENSION = ['.iso', '.ovf'];

@Component({
  selector: 'mcs-media-upload-details',
  templateUrl: 'media-upload-details.component.html'
})

export class MediaUploadDetailsComponent
  implements McsSafeToNavigateAway, OnInit, OnDestroy {

  public resources$: Observable<McsResource[]>;
  public selectedCatalog$: BehaviorSubject<McsResourceCatalogItem>;
  public selectedResource$: Observable<McsResource>;
  public selectedResourceId: string;

  public mediaUploading: boolean;
  public urlInfoMessage: string;
  public mediaUrlExtensions: string[] = MEDIA_URL_EXTENSION;

  // Form variables
  public fgMediaUpload: FormGroup;
  public fcResources: FormControl;
  public fcCatalogs: FormControl;
  public fcMediaName: FormControl;
  public fcMediaUrl: FormControl;
  public fcMediaUrlExtension: FormControl;
  public fcMediaDescription: FormControl;

  private _mediaUrlStatusIconKey: string;
  public get mediaUrlStatusIconKey(): string { return this._mediaUrlStatusIconKey; }
  public set mediaUrlStatusIconKey(value: string) {
    this._mediaUrlStatusIconKey = value;
    this._changeDetectorRef.markForCheck();
  }

  private _destroySubject = new Subject<void>();

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  constructor(
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _formGroupService: McsFormGroupService,
    private _errorHandlerService: McsErrorHandlerService,
    private _resourcesRepository: McsResourcesRepository,
    private _mediaUploadService: MediaUploadService
  ) {
    this.selectedCatalog$ = new BehaviorSubject(undefined);
  }

  public ngOnInit() {
    this._registerFormGroup();
    this._subscribeToResourcesDataChange();
    this._subsribeToResources();
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
  public safeToNavigateAway(): boolean {
    return !this._formGroup.hasDirtyFormControls() || this.mediaUploading;
  }

  /**
   * Event that emits whenever a resource has been change
   */
  public onChangeResource(resource: McsResource): void {
    if (isNullOrEmpty(resource)) { return; }
    this.selectedResourceId = resource.id;
    this._subscribeToResourceById(resource.id);
  }

  /**
   * Event that emits whenever a catalog item has been change
   */
  public onChangeCatalog(_catalog: McsResourceCatalogItem): void {
    if (isNullOrEmpty(_catalog)) { return; }
    this.selectedCatalog$.next(_catalog);
  }

  /**
   * Event that emits when the media url textbox has lost focused
   */
  public onBlurMediaUrl(): void {
    if (this.fcMediaUrl.hasError('url')) { return; }
    this.fcMediaUrl.markAsPending();
    this.mediaUrlStatusIconKey = CoreDefinition.ASSETS_GIF_LOADER_ELLIPSIS;
    let mediaUrl = this.fcMediaUrl.value + this.fcMediaUrlExtension.value;

    this._mediaUploadService.validateUrl(
      this.selectedResourceId,
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
   * Filters all unique catalog items from the resource
   * @param resource Selected resource where to extract the catalog items
   */
  public filterUniqueCatalogs(resource: McsResource): McsResourceCatalogItem[] {
    let catalogItems = getSafeProperty(resource, (obj) => obj.catalogItems, []).slice();
    catalogItems = getUniqueRecords(catalogItems, (catalog) => catalog.name);
    return catalogItems;
  }

  /**
   * Event that emits when the form will be submitted
   */
  public onSubmitMediaUpload(): void {
    if (!this._validateFormFields()) { return; }

    let uploadMediaModel = new McsResourceCatalogItemCreate();
    uploadMediaModel.name = this.fcMediaName.value;
    uploadMediaModel.catalogName = this.selectedCatalog$.getValue().name;
    uploadMediaModel.url = this.fcMediaUrl.value;
    uploadMediaModel.description = this.fcMediaDescription.value;
    uploadMediaModel.type = CatalogItemType.Media;
    uploadMediaModel.clientReferenceObject = {
      resourcePath: CoreRoutes.getNavigationPath(RouteKey.Medium)
    };

    this._mediaUploadService.uploadMedia(
      this.selectedResourceId,
      uploadMediaModel
    ).pipe(
      catchError((httpError) => {
        this._mediaUploadService.setErrors(httpError.errorMessages);
        return throwError(httpError);
      }),
      tap(() => this.mediaUploading = true),
      finalize(() => this._changeDetectorRef.markForCheck())
    ).subscribe();
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

  /**
   * Subscribes to the resource by id
   * @param resourceId Resource id to be find in the resources
   */
  private _subscribeToResourceById(resourceId: string): void {
    this._eventDispatcher.dispatch(CoreEvent.loaderShow);

    this.selectedResource$ = this._resourcesRepository.getByIdAsync(
      resourceId, this._onResourceObtained.bind(this)
    ).pipe(
      shareReplay(1),
      catchError((error) => {
        this._errorHandlerService.redirectToErrorPage(error.status);
        return throwError(error);
      }),
      tap(() => this._resetFormFields())
    );
  }

  /**
   * Event that emits when the resource has been obtained
   */
  private _onResourceObtained(): void {
    this._eventDispatcher.dispatch(CoreEvent.loaderHide);
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

    this.fcMediaUrlExtension = new FormControl(this.mediaUrlExtensions[0],
      [
        CoreValidators.required,
      ]
    );
    this.fcMediaUrlExtension.valueChanges.subscribe(() => {
      this.mediaUrlStatusIconKey = undefined;
      this.urlInfoMessage = undefined;
    });

    this.fcMediaUrl = new FormControl('',
      [
        CoreValidators.required,
        CoreValidators.url
      ]
    );

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
      fcMediaUrlExtension: this.fcMediaUrlExtension,
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
    this.fcMediaUrlExtension.setValue(this.mediaUrlExtensions[0]);
  }
}
