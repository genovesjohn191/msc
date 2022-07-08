import {
  throwError,
  Observable,
  Subject,
  EMPTY
} from 'rxjs';
import {
  catchError,
  map,
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup
} from '@angular/forms';

import { CoreValidators } from '@app/core';
import {
  HttpStatusCode,
  McsExtenderService,
  McsExtendersQueryParams,
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsFormGroupDirective } from '@app/shared';
import {
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition,
  coerceNumber,
  compareStrings,
  convertUrlParamsKeyToLowerCase
} from '@app/utilities';

import {
  ChangeExtenderSpeed,
  ChangeExtenderSpeedInfo,
  ExtenderSpeedConfig,
  extenderSpeedSliderDefaultValues
} from '../shared/change-extender-speed';
import {
  ActivatedRoute,
  Params
} from '@angular/router';

const DEFAULT_MIN_DESIRED_SPEED = 0;
const DEFAULT_STEP_DESIRED_SPEED = 1;

@Component({
  selector: 'mcs-change-extender-speed',
  templateUrl: 'change-extender-speed.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ChangeExtenderSpeedComponent implements OnInit, OnDestroy {

  public cloudExtenders$: Observable<McsExtenderService[]>;

  public fgChangeExtenderSpeedDetails: FormGroup<any>;
  public fcExtenderService: FormControl<any>;

  public selectedService: string;

  // desired speed
  public sliderTable: ChangeExtenderSpeed[];
  public sliderTableSize: number;
  public currentDesiredSpeed: number = 10;
  public desiredSpeedSliderValueIndex: number = 0;
  public desiredSpeedSliderValue: number;

  private _formGroup: McsFormGroupDirective;
  private _destroySubject = new Subject<void>();

  private _extenderSpeedOutput = new ChangeExtenderSpeedInfo();
  private _errorStatus: number;
  private _cloudExtendersCount: number;

  @Input()
  public config: ExtenderSpeedConfig;

  @Output()
  public dataChange = new EventEmitter<ChangeExtenderSpeedInfo>();

  @ViewChild(McsFormGroupDirective)
  public set formGroup(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
  }

  constructor(
    _injector: Injector,
    private _activatedRoute: ActivatedRoute,
    private _apiService: McsApiService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder
  ) {
    this._createDesiredSpeedSliderTable();
    this._registerFormGroup();
  }

  public ngOnInit() {
    this._subscribesToQueryParams();
    this._getAllHybridCloudExtenders();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  public getFormGroup(): McsFormGroupDirective {
    return this._formGroup;
  }

  public get desiredSpeedMin(): number {
    return DEFAULT_MIN_DESIRED_SPEED;
  }

  public get desiredSpeedMax(): number {
    return this.sliderTableSize;
  }

  public get desiredSpeedSliderStep(): number {
    return DEFAULT_STEP_DESIRED_SPEED;
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get showPermissionErrorFallbackText(): boolean {
    return this._errorStatus === HttpStatusCode.Forbidden;
  }

  public get noServicesToDisplay(): boolean {
    return !isNullOrEmpty(this._errorStatus) || this._cloudExtendersCount === 0;
  }

  public get noServicesFallbackText(): string {
    if (!this.noServicesToDisplay) { return; }
    return this.showPermissionErrorFallbackText ? 'message.noPermissionFallbackText' : 'message.noServiceToDisplay';
  }

  public get formIsValid(): boolean {
    let extenderSpeedHasChanged = compareStrings(
      JSON.stringify(this.desiredSpeedSliderValue), JSON.stringify(this.fcExtenderService?.value?.speedMbps)) !== 0;
    return getSafeProperty(this._formGroup, (obj) => obj.isValid() && extenderSpeedHasChanged);
  }

  public onDesiredSpeedSliderChanged(index?: number): void {
    this.desiredSpeedSliderValueIndex = index === undefined ?
      this._getSpeedSliderTableIndex(this.fcExtenderService?.value?.speedMbps) : index;
    this.desiredSpeedSliderValue = this.sliderTable[this.desiredSpeedSliderValueIndex].desiredSpeed;
    this._changeDetectorRef.markForCheck();
    this._notifyDataChange();
  }

  public onChangeExtenderService(): void {
    if (isNullOrEmpty(this.fcExtenderService?.value)) { return; }
    this.currentDesiredSpeed = this._setCurrentDesiredSpeed();
    this.onDesiredSpeedSliderChanged();
    this._changeDetectorRef.markForCheck();
    this._notifyDataChange();
  }

  private _notifyDataChange(): void {
    this._extenderSpeedOutput.desiredSpeed = this.sliderTable[this.desiredSpeedSliderValueIndex].desiredSpeed;
    this._extenderSpeedOutput.serviceId = this.fcExtenderService?.value?.serviceId;
    this._extenderSpeedOutput.speedHasChanged = compareStrings(
      JSON.stringify(this.desiredSpeedSliderValue), JSON.stringify(this.fcExtenderService?.value?.speedMbps)) !== 0;
    // Emit changes
    this.dataChange.emit(this._extenderSpeedOutput);
    this._changeDetectorRef.markForCheck();
  }

  private _setCurrentDesiredSpeed(): number {
    return coerceNumber(getSafeProperty(this.fcExtenderService?.value, (obj) => obj.speedMbps), 10);
  }

  private _getSpeedSliderTableIndex(speed: number): number {
    let index = extenderSpeedSliderDefaultValues.indexOf(speed);
    return index === -1 ? 0 : index;
  }

  private _createDesiredSpeedSliderTable(): void {
    // Create table definitions
    let extenderSpeedScaleTable = new Array<ChangeExtenderSpeed>();
    let tableSize = extenderSpeedSliderDefaultValues.length;
    for (let index = 0; index < tableSize; index++) {
      let desiredSpeedScaleItem = {
        desiredSpeed: extenderSpeedSliderDefaultValues[index]
      } as ChangeExtenderSpeed;
      extenderSpeedScaleTable.push(desiredSpeedScaleItem);
    }
    this.sliderTable = extenderSpeedScaleTable;
    this.sliderTableSize = this.sliderTable.length - 1;
  }

  private _registerFormGroup() {
    this.fcExtenderService = new FormControl<any>('', [CoreValidators.required]);

    this.fgChangeExtenderSpeedDetails = this._formBuilder.group({
      fcExtenderService: this.fcExtenderService
    });
  }

  private _getAllHybridCloudExtenders(): void {
    let queryParam = new McsExtendersQueryParams();
    queryParam.serviceEnd = 'A';

    this.cloudExtenders$ = this._apiService.getExtenders(queryParam).pipe(
      map((response) => {
        let cloudExtenders = getSafeProperty(response, (obj) =>
          obj.collection).filter((service) => service.ExtenderTypeText === this.config.extenderServiceProductType);
        this._cloudExtendersCount = cloudExtenders?.length;
        this._setExtenderServiceDefaultValue(cloudExtenders);
        return cloudExtenders;
      }),
      catchError((error) => {
        this._errorStatus = error?.details?.status;
        return throwError(error);
      }),
      shareReplay(1)
    );
  }

  private _setExtenderServiceDefaultValue(services: McsExtenderService[]): void {
    if (isNullOrEmpty(this.selectedService) && isNullOrEmpty(services)) { return; }
    let selectedService = services.find((service) => compareStrings(service.serviceId, this.selectedService) === 0);
    this.fcExtenderService.setValue(selectedService);
    this.onChangeExtenderService();
  }

  private _subscribesToQueryParams(): void {
    this._activatedRoute.queryParams.pipe(
      takeUntil(this._destroySubject),
      catchError(() => EMPTY),
      map((params: Params) => {
        let lowercaseParams: Params = convertUrlParamsKeyToLowerCase(params);
        return lowercaseParams.serviceid;
      }),
      tap((serviceId: string) => {
        this.selectedService = serviceId;
    })).subscribe();
  }
}