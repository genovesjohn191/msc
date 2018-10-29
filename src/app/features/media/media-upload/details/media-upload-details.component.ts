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
  BehaviorSubject,
  throwError,
  Observable,
  of
} from 'rxjs';
import {
  catchError,
  tap,
  finalize,
  switchMap,
  take,
  shareReplay
} from 'rxjs/operators';
import {
  McsTextContentProvider,
  CoreValidators,
  CoreDefinition,
  McsErrorHandlerService,
  McsFormGroupService,
  McsScrollDispatcherService,
  McsLoadingService,
  CoreRoutes
} from '@app/core';
import {
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
  CatalogItemType,
  McsResourceCatalogItem,
  RouteKey
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
  public catalogItems$: Observable<McsResourceCatalogItem[]>;
  public selectedCatalog$: BehaviorSubject<McsResourceCatalogItem>;
  public selectedResource$: Observable<McsResource>;
  public selectedResourceId: string;

  public mediaUploading: boolean;
  public urlInfoMessage: string;
  public uploadMediaFunc = this._uploadMedia.bind(this);

  // Form variables
  public fgMediaUpload: FormGroup;
  public fcResources: FormControl;
  public fcCatalogs: FormControl;
  public fcMediaName: FormControl;
  public fcMediaUrl: FormControl;
  public fcMediaDescription: FormControl;

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
    private _loadingService: McsLoadingService,
    private _errorHandlerService: McsErrorHandlerService,
    private _resourcesRepository: ResourcesRepository,
    private _mediaUploadService: MediaUploadService,
    private _scrollElementService: McsScrollDispatcherService
  ) {
    this.selectedCatalog$ = new BehaviorSubject(undefined);
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.mediaUpload.mediaStepDetails;
    this._registerFormGroup();
    this._subsribeToResources();
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      if (!isNullOrEmpty(this._stepAlertMessage)) {
        this._stepAlertMessage.removeComponent();
      }
    });
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
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
  public onChangeResource(_resource: McsResource): void {
    if (isNullOrEmpty(_resource)) { return; }
    this.selectedResourceId = _resource.id;
    this._subscribeToResourceById(_resource.id);
    this._subscribeToCatalogItems();
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
    let mediaUrl = this.fcMediaUrl.value;

    this.mediaUrlStatusIconKey = CoreDefinition.ASSETS_GIF_LOADER_ELLIPSIS;
    this._mediaUploadService.validateUrl(
      this.selectedResourceId,
      mediaUrl
    ).pipe(
      catchError((_httpError: HttpErrorResponse) => {
        if (isNullOrEmpty(_httpError)) { return throwError(_httpError); }
        this.mediaUrlStatusIconKey = CoreDefinition.ASSETS_SVG_ERROR;
        this.urlInfoMessage = getSafeProperty(_httpError, (obj) => obj.error.errors[0].message);
        this.fcMediaUrl.setErrors({ urlValidationError: true });
        return throwError(_httpError);
      })
    ).subscribe((response) => {
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
    uploadMediaModel.catalogName = this.selectedCatalog$.getValue().name;
    uploadMediaModel.url = this.fcMediaUrl.value;
    uploadMediaModel.description = this.fcMediaDescription.value;
    uploadMediaModel.type = CatalogItemType.Media;
    uploadMediaModel.clientReferenceObject.resourcePath =
      CoreRoutes.getNavigationPath(RouteKey.Medium);

    this._stepAlertMessage.removeComponent();
    return this._mediaUploadService.uploadMedia(
      this.selectedResourceId,
      uploadMediaModel
    ).pipe(
      catchError((_error) => {
        this._stepAlertMessage.createComponent();
        this._scrollElementService.scrollToElement(this._stepAlertMessage.elementRef.nativeElement);
        return throwError(_error);
      }),
      tap(() => {
        this.mediaUploading = true;
        this._stepAlertMessage.removeComponent();
      }),
      finalize(() => this._changeDetectorRef.markForCheck())
    );
  }

  /**
   * Subscribes to all the resources on the repository
   */
  private _subsribeToResources(): void {
    this._loadingService.showLoader(this.textContent.loadingResources);
    this.resources$ = this._resourcesRepository.findAllRecords()
      .pipe(
        catchError((error) => {
          this._errorHandlerService.handleHttpRedirectionError(error.status);
          return throwError(error);
        }),
        finalize(() => this._loadingService.hideLoader())
      );
  }

  /**
   * Subscribes to the resource by id
   * @param resourceId Resource id to be find in the resources
   */
  private _subscribeToResourceById(resourceId: string): void {
    this._loadingService.showLoader(this.textContent.loadingResourceDetails);
    this.selectedResource$ = this._resourcesRepository.findRecordById(resourceId).pipe(
      shareReplay(1),
      catchError((error) => {
        this._errorHandlerService.handleHttpRedirectionError(error.status);
        return throwError(error);
      }),
      finalize(() => this._loadingService.hideLoader())
    );
  }

  /**
   * Subscribe to catalog items for every resource change
   */
  private _subscribeToCatalogItems(): void {
    this.catalogItems$ = this.selectedResource$.pipe(
      switchMap((response) => {
        let uniqueMapList = new Map<string, McsResourceCatalogItem>();
        let catalogItems = getSafeProperty(response, (obj) => obj.catalogItems);
        if (!isNullOrEmpty(catalogItems)) {
          catalogItems.forEach((_catalog) => {
            let itemExist = uniqueMapList.get(_catalog.name);
            if (!itemExist) {
              uniqueMapList.set(_catalog.name, _catalog);
            }
          });
        }
        return of(Array.from(uniqueMapList.values()));
      }),
      take(1)
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
