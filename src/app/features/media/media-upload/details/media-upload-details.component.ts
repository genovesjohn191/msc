import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ElementRef,
  AfterViewInit,
  ViewChild
} from '@angular/core';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Subject,
  Subscription,
  throwError,
  Observable,
  of
} from 'rxjs';
import {
  catchError,
  tap,
  finalize
} from 'rxjs/operators';
import {
  McsTextContentProvider,
  CoreValidators,
  CoreDefinition,
  McsErrorHandlerService,
  McsFormGroupService,
  McsScrollDispatcherService
} from '@app/core';
import {
  unsubscribeSubject,
  unsubscribeSafely,
  isNullOrEmpty,
  McsSafeToNavigateAway,
  getSafeProperty
} from '@app/utilities';
import { ResourcesRepository } from '@app/services';
import {
  McsResource,
  McsJob,
  McsResourceCatalogItemCreate,
  CatalogItemType
} from '@app/models';
import {
  FormGroupDirective,
  ComponentHandlerDirective
} from '@app/shared';
import { MediaUploadService } from '../media-upload.service';

@Component({
  selector: 'mcs-media-upload-details',
  templateUrl: 'media-upload-details.component.html'
})

export class MediaUploadDetailsComponent
  implements McsSafeToNavigateAway, OnInit, AfterViewInit, OnDestroy {

  public textContent: any;
  public resources$: Observable<McsResource[]>;
  public selectedResource: McsResource;
  public urlInfoMessage: string;
  public uploadMediaFunc = this._uploadMedia.bind(this);

  // Form variables
  public fgMediaUpload: FormGroup;
  public fcResources: FormControl;
  public fcMediaName: FormControl;
  public fcMediaUrl: FormControl;
  public fcMediaDescription: FormControl;

  public loaderSubscription = new Subscription();

  private _mediaUrlStatusIconKey: string;
  public get mediaUrlStatusIconKey(): string { return this._mediaUrlStatusIconKey; }
  public set mediaUrlStatusIconKey(value: string) {
    this._mediaUrlStatusIconKey = value;
    this._changeDetectorRef.markForCheck();
  }

  private _destroySubject = new Subject<void>();

  @ViewChild(FormGroupDirective)
  private _formGroup: FormGroupDirective;

  @ViewChild(ComponentHandlerDirective)
  private _stepAlertMessage: ComponentHandlerDirective;

  constructor(
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _formGroupService: McsFormGroupService,
    private _errorHandlerService: McsErrorHandlerService,
    private _resourcesRepository: ResourcesRepository,
    private _mediaUploadService: MediaUploadService,
    private _scrollElementService: McsScrollDispatcherService
  ) { }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.mediaUpload.mediaStepDetails;
    this._registerFormGroup();
    this._getResources();
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      if (!isNullOrEmpty(this._stepAlertMessage)) {
        this._stepAlertMessage.removeComponent();
      }
    });
  }

  public ngOnDestroy() {
    unsubscribeSafely(this.loaderSubscription);
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Event that emits when navigating away from this component page
   */
  public safeToNavigateAway(): boolean {
    return !this._formGroup.hasDirtyFormControls();
  }

  /**
   * Event that emits whenever a resource is selected
   */
  public onChangeResource(_resource: McsResource): void {
    if (isNullOrEmpty(_resource)) { return; }
    this.selectedResource = _resource;
  }

  /**
   * Event that emits when the media url textbox has lost focused
   */
  public onBlurMediaUrl(): void {
    if (this.fcMediaUrl.hasError('url')) { return; }
    let mediaUrl = this.fcMediaUrl.value;

    this.mediaUrlStatusIconKey = CoreDefinition.ASSETS_GIF_LOADER_ELLIPSIS;
    this._mediaUploadService.validateUrl(this.selectedResource.id, mediaUrl)
      .pipe(
        catchError((_httpError: HttpErrorResponse) => {
          if (isNullOrEmpty(_httpError)) { return throwError(_httpError); }
          this.mediaUrlStatusIconKey = CoreDefinition.ASSETS_SVG_ERROR;
          this.urlInfoMessage = getSafeProperty(_httpError, (obj) => obj.error.errors[0].message);
          this.fcMediaUrl.setErrors({ urlValidationError: true });
          return throwError(_httpError);
        })
      )
      .subscribe((response) => {
        this.mediaUrlStatusIconKey = CoreDefinition.ASSETS_SVG_SUCCESS;
        this.urlInfoMessage = getSafeProperty(response, (obj) => obj.content[0].message);
      });
  }

  /**
   * Upload media based on form contents
   */
  private _uploadMedia(): Observable<McsJob> {
    if (!this._validateFormFields()) { return of(undefined); }
    let uploadMediaModel = new McsResourceCatalogItemCreate();
    uploadMediaModel.name = this.fcMediaName.value;
    uploadMediaModel.catalogName = 'dummy-catalog-name';
    uploadMediaModel.url = this.fcMediaUrl.value;
    uploadMediaModel.description = this.fcMediaDescription.value;
    uploadMediaModel.type = CatalogItemType.Media;

    this._stepAlertMessage.removeComponent();
    return this._mediaUploadService.uploadMedia(
      this.selectedResource.id,
      uploadMediaModel
    ).pipe(
      catchError((_error) => {
        this._stepAlertMessage.createComponent();
        this._scrollElementService.scrollToElement(this._stepAlertMessage.elementRef.nativeElement);
        return throwError(_error);
      }),
      tap(() => {
        this._stepAlertMessage.removeComponent();
      }),
      finalize(() => this._changeDetectorRef.markForCheck())
    );
  }

  /**
   * Get all the resources from the repository
   */
  private _getResources(): void {
    this.resources$ = this._resourcesRepository.findAllRecords()
      .pipe(
        catchError((error) => {
          this._errorHandlerService.handleHttpRedirectionError(error.status);
          return throwError(error);
        }),
        finalize(() => unsubscribeSafely(this.loaderSubscription))
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

    this.fcMediaName = new FormControl('', [
      CoreValidators.required,
      CoreValidators.custom(
        this._validateMediaName.bind(this),
        'mediaNameInvalid'
      )
    ]);

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
      fcMediaName: this.fcMediaName,
      fcMediaUrl: this.fcMediaUrl,
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
    let formIsValid = getSafeProperty(this.fgMediaUpload, (obj) => obj.valid);
    if (formIsValid) { return true; }
    this._formGroupService.touchAllFieldsByFormGroup(this.fgMediaUpload);
    this._formGroupService.scrollToFirstInvalidField(this._elementRef.nativeElement);
    return false;
  }
}
