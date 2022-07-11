import {
  of,
  throwError,
  BehaviorSubject,
  EMPTY,
  Observable,
  Subject
} from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  FormControl,
  FormGroup
} from '@angular/forms';
import {
  CoreValidators,
  IMcsNavigateAwayGuard,
  McsFormGroupService
} from '@app/core';
import {
  CatalogItemType,
  McsApiErrorContext,
  McsResource,
  McsResourceCatalog,
  McsResourceCatalogItemCreate
} from '@app/models';
import { McsFormGroupDirective } from '@app/shared';
import {
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';

import { MediaUploadService } from '../media-upload.service';

@Component({
  selector: 'mcs-media-upload-details',
  templateUrl: 'media-upload-details.component.html'
})

export class MediaUploadDetailsComponent
  implements OnInit, OnDestroy, IMcsNavigateAwayGuard {

  public resources$: Observable<McsResource[]>;
  public resourceIdChange$ = new BehaviorSubject<string>(null);

  public mediaUrlValidationInProgress$: Observable<boolean>;
  public resourceCatalogs$: Observable<McsResourceCatalog[]>;
  public selectedResource$: Observable<McsResource>;

  public urlInfoMessage: any;
  public urlErrorObj: any;
  public mediaExtensions$: Observable<string[]>;

  // Form variables
  public fgMediaUpload: FormGroup<any>;
  public fcResources: FormControl<McsResource>;
  public fcCatalogs: FormControl<McsResourceCatalog>;
  public fcMediaName: FormControl<string>;
  public fcMediaUrl: FormControl<string>;
  public fcMediaExtension: FormControl<any>;
  public fcMediaDescription: FormControl<string>;

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
    private _mediaUploadService: MediaUploadService
  ) { }

  public ngOnInit() {
    this._registerFormGroup();
    this._subsribeToResourceChange();
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
   * Event that emits when the media url textbox has lost focused
   */
  public onChangeMediaUrl(): void {
    if (this.fcMediaUrl.pristine ||
      this.fcMediaUrl.hasError('url')) { return; }

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
        if (isNullOrEmpty(httpError)) { return EMPTY; }

        this.mediaUrlStatusIconKey = CommonDefinition.ASSETS_SVG_ERROR;
        this.urlErrorObj = {
          urlError: getSafeProperty(httpError, (obj) => obj.details.errorMessages[0])
        };
        this.fcMediaUrl.setErrors({ validationError: true });
        this._changeDetectorRef.markForCheck();
        return EMPTY;
      })
    ).subscribe((response) => {
      this._mediaUrlValidationInProgressChange.next(false);
      this.fcMediaUrl.updateValueAndValidity();
      this.mediaUrlStatusIconKey = CommonDefinition.ASSETS_SVG_SUCCESS;
      this.urlInfoMessage = getSafeProperty(response, (obj) => obj[0].message);
      this._changeDetectorRef.markForCheck();
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
      hideDetailsButton: uploadMediaModel.name.includes(CommonDefinition.FILE_EXTENSION_OVA),
      ticketServiceId: !selectedResource.isSelfManaged && selectedResource.serviceId
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
    this.mediaExtensions$ = of([
      `.${CommonDefinition.FILE_EXTENSION_ISO}`,
      `.${CommonDefinition.FILE_EXTENSION_OVA}`
    ]);
  }

  /**
   * Subscribes to all the resources on the repository
   */
  private _subsribeToResourceChange(): void {
    this.fcResources.valueChanges.pipe(
      takeUntil(this._destroySubject),
      tap((resource: McsResource) => {
        if (isNullOrEmpty(resource?.id)) { return; }
        this.resourceIdChange$.next(resource?.id);
      })
    ).subscribe();
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
   * Registers the form group including its form fields
   */
  private _registerFormGroup(): void {
    // Register Form Controls
    this.fcResources = new FormControl<McsResource>(null, [
      CoreValidators.required
    ]);

    this.fcCatalogs = new FormControl<McsResourceCatalog>(null, [
      CoreValidators.required
    ]);

    this.fcMediaName = new FormControl<string>('', [
      CoreValidators.required,
      CoreValidators.custom(
        this._validateMediaName.bind(this),
        'mediaNameInvalid'
      )
    ]);

    this.fcMediaExtension = new FormControl<any>('', [
      CoreValidators.required
    ]);
    this.fcMediaUrl = new FormControl<string>('', [
      CoreValidators.required
    ]);
    this.fcMediaUrl.valueChanges.pipe(
      takeUntil(this._destroySubject),
      debounceTime(2000),
      distinctUntilChanged(),
      tap(() => {
        this.mediaUrlStatusIconKey = null;
        this.urlInfoMessage = null;

        this.onChangeMediaUrl();
        this._changeDetectorRef.markForCheck();
      })
    ).subscribe();
    this.fcMediaDescription = new FormControl<string>('', []);

    // Register Form Groups using binding
    this.fgMediaUpload = new FormGroup<any>({
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
