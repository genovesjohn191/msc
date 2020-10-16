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
  of,
  empty,
  BehaviorSubject
} from 'rxjs';
import {
  catchError,
  tap,
  finalize,
  shareReplay,
  map,
  distinctUntilChanged
} from 'rxjs/operators';
import {
  CoreValidators,
  McsFormGroupService,
  IMcsNavigateAwayGuard
} from '@app/core';
import {
  unsubscribeSafely,
  isNullOrEmpty,
  getSafeProperty,
  CommonDefinition
} from '@app/utilities';
import { McsApiService } from '@app/services';
import {
  McsResource,
  McsResourceCatalogItemCreate,
  CatalogItemType,
  McsResourceCatalog,
  McsApiErrorContext
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
  public mediaUrlValidationInProgress$: Observable<boolean>;
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

  private _mediaUrlValidationInProgressChange = new BehaviorSubject<boolean>(false);
  private _destroySubject = new Subject<void>();

  public get mediaUrlStatusIconKey(): string { return this._mediaUrlStatusIconKey; }
  public set mediaUrlStatusIconKey(value: string) {
    this._mediaUrlStatusIconKey = value;
    this._changeDetectorRef.markForCheck();
  }
  private _mediaUrlStatusIconKey: string;

  constructor(
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formGroupService: McsFormGroupService,
    private _apiService: McsApiService,
    private _mediaUploadService: MediaUploadService
  ) { }

  public ngOnInit() {
    this._registerFormGroup();
    this._subsribeToResources();
    this._subscribeToMediaUrlValidationInProgress();
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
    this._subscribeToResourceCatalogs(resource.id);
  }

  /**
   * Event that emits when the media url textbox has lost focused
   */
  public onBlurMediaUrl(): void {
    if (this.fcMediaUrl.hasError('url')) { return; }
    this._mediaUrlValidationInProgressChange.next(true);
    this.fcMediaUrl.markAsPending();
    this.mediaUrlStatusIconKey = CommonDefinition.ASSETS_GIF_LOADER_ELLIPSIS;
    let mediaUrl = this.fcMediaUrl.value;
    let selectedResource: McsResource = this.fcResources.value;

    this._mediaUploadService.validateUrl(
      selectedResource.id,
      mediaUrl
    ).pipe(
      catchError((httpError: McsApiErrorContext) => {
        if (isNullOrEmpty(httpError)) { return empty(); }
        this.mediaUrlStatusIconKey = CommonDefinition.ASSETS_SVG_ERROR;
        this.urlInfoMessage = getSafeProperty(httpError, (obj) => obj.details.errorMessages[0]);
        this.fcMediaUrl.setErrors({ urlValidationError: true });
        return empty();
      })
    ).subscribe((response) => {
      this._mediaUrlValidationInProgressChange.next(false);
      this.fcMediaUrl.updateValueAndValidity();
      this.mediaUrlStatusIconKey = CommonDefinition.ASSETS_SVG_SUCCESS;
      this.urlInfoMessage = getSafeProperty(response, (obj) => obj[0].message);
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
    this.resources$ = this._apiService.getResources().pipe(
      map((response) =>
        getSafeProperty(response, (obj) => obj.collection)
          .filter((resource) => !resource.isDedicated)
      )
    );
  }

  /**
   * Subscribe to media url validation in progress flag
   */
  public _subscribeToMediaUrlValidationInProgress(): void {
    this.mediaUrlValidationInProgress$ = this._mediaUrlValidationInProgressChange.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  /**
   * Subscribes to resource catalogs
   * @param resourceId Resource id of the catalogs
   */
  private _subscribeToResourceCatalogs(resourceId: string): void {
    if (isNullOrEmpty(resourceId)) { return; }

    this.resourceCatalogs$ = this._apiService.getResourceCatalogs(resourceId).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.collection)),
      tap(() => this._resetFormFields()),
      shareReplay(1)
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
    return CommonDefinition.REGEX_MEDIA_NAME_PATTERN.test(inputValue);
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
