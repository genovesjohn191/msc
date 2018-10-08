import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ElementRef
} from '@angular/core';
import {
  Subject,
  Subscription,
  throwError,
  Observable,
  of
} from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap
} from 'rxjs/operators';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import {
  McsTextContentProvider,
  CoreValidators,
  CoreDefinition,
  McsErrorHandlerService,
  McsFormGroupService
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
import { MediaUploadService } from '../media-upload.service';

@Component({
  selector: 'mcs-media-upload-details',
  templateUrl: 'media-upload-details.component.html'
})

export class MediaUploadDetailsComponent implements McsSafeToNavigateAway, OnInit, OnDestroy {
  public textContent: any;
  public resourcesSubscription: Subscription;
  public resources: McsResource[];
  public selectedResource: McsResource;
  public uploadMediaFunc = this._uploadMedia.bind(this);

  // Form variables
  public fgMediaUpload: FormGroup;
  public fcResources: FormControl;
  public fcMediaName: FormControl;
  public fcMediaUrl: FormControl;
  public fcMediaDescription: FormControl;

  private _destroySubject = new Subject<void>();

  constructor(
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _formGroupService: McsFormGroupService,
    private _errorHandlerService: McsErrorHandlerService,
    private _resourcesRepository: ResourcesRepository,
    private _mediaUploadService: MediaUploadService
  ) { }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.mediaUpload.mediaStepDetails;
    this._registerFormGroup();
    this._getResources();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this.resourcesSubscription);
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Returns the icon key to be displayed in the url
   */
  public get mediaUrlStatusIconKey(): string {
    if (isNullOrEmpty(this.fcMediaUrl)) { return undefined; }
    return this.fcMediaUrl.pending ?
      CoreDefinition.ASSETS_GIF_LOADER_SPINNER :
      this.fcMediaUrl.valid ? CoreDefinition.ASSETS_SVG_SUCCESS : undefined;
  }

  /**
   * Event that emits when navigating away from this component page
   */
  public safeToNavigateAway(): boolean {
    return !getSafeProperty(this.fgMediaUpload, (obj) => obj.dirty);
  }

  /**
   * Event that emits whenever a resource is selected
   */
  public onChangeResource(_resource: McsResource): void {
    if (isNullOrEmpty(_resource)) { return; }
    this.selectedResource = _resource;
  }

  /**
   * Upload media based on form contents
   */
  private _uploadMedia(): Observable<McsJob> {
    if (!this._validateFormFields()) { return of(undefined); }
    let uploadMediaModel = new McsResourceCatalogItemCreate();
    uploadMediaModel.name = this.fcMediaName.value;
    uploadMediaModel.url = this.fcMediaUrl.value;
    uploadMediaModel.description = this.fcMediaDescription.value;
    uploadMediaModel.type = CatalogItemType.Media;

    return this._mediaUploadService.uploadMedia(
      this.selectedResource.id,
      uploadMediaModel
    );
  }

  /**
   * Get all the resources from the repository
   */
  private _getResources(): void {
    this.resourcesSubscription = this._resourcesRepository.findAllRecords()
      .pipe(
        catchError((error) => {
          this._errorHandlerService.handleHttpRedirectionError(error.status);
          return throwError(error);
        })
      ).subscribe(() => this.resources = this._resourcesRepository.dataRecords);
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
      ],
      [
        CoreValidators.customAsync(
          this._validateMediaUrlExistence.bind(this),
          'emailNotExist'
        )
      ]
    );
    this.fcMediaUrl.statusChanges.subscribe(() => this._changeDetectorRef.markForCheck());
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
   * Validate the media url existence from API
   * @param input Inputted url to be checked
   */
  private _validateMediaUrlExistence(input: any): Observable<boolean> {
    return this.fcMediaUrl.valueChanges.pipe(
      debounceTime(CoreDefinition.SEARCH_TIME),
      distinctUntilChanged(),
      switchMap(() => this._mediaUploadService.isUrlExist(input))
    );
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
