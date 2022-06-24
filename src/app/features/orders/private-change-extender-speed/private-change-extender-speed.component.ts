import {
  throwError,
  Observable,
  Subject,
  zip,
  EMPTY
} from 'rxjs';
import {
  catchError,
  filter,
  map,
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup
} from '@angular/forms';
import {
  CoreValidators,
  McsOrderWizardBase,
  OrderRequester
} from '@app/core';
import { OrderDetails } from '@app/features-shared';
import {
  ExtenderType,
  extenderTypeText,
  HttpStatusCode,
  McsExtenderService,
  McsExtendersQueryParams,
  McsOrderCreate,
  McsOrderItemCreate,
  McsOrderWorkflow,
  OrderIdType
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsFormGroupDirective } from '@app/shared';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition,
  Guid,
  coerceNumber,
  compareStrings,
  convertUrlParamsKeyToLowerCase
} from '@app/utilities';

import { PrivateChangeExtenderSpeedService } from './private-change-extender-speed.service';
import {
  PrivateChangeExtenderSpeed,
  privateExtenderSpeedSliderDefaultValues
} from './private-change-extender-speed';
import { ActivatedRoute, Params } from '@angular/router';

type ExtenderSpeedProperties = {
  speedMbps: number;
};

const PRIVATE_CHANGE_EXTENDER_SPEED_REF_ID = Guid.newGuid().toString();
const DEFAULT_MIN_DESIRED_SPEED = 0;
const DEFAULT_STEP_DESIRED_SPEED = 1;

@Component({
  selector: 'mcs-order-private-change-extender-speed',
  templateUrl: 'private-change-extender-speed.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PrivateChangeExtenderSpeedService]
})

export class PrivateChangeExtenderSpeedComponent extends McsOrderWizardBase
  implements OnInit, OnDestroy {

  public cloudExtenders$: Observable<McsExtenderService[]>;

  public fgextenderServiceDetails: FormGroup;
  public fcExtenderService: FormControl;

  public selectedService: string;

  // desired speed
  public sliderTable: PrivateChangeExtenderSpeed[];
  public sliderTableSize: number;
  public currentDesiredSpeed: number = 10;
  public desiredSpeedSliderValueIndex: number = 0;
  public desiredSpeedSliderValue: number;

  private _formGroup: McsFormGroupDirective;
  private _destroySubject = new Subject<void>();
  private _formGroupSubject = new Subject<void>();

  private _errorStatus: number;
  private _cloudExtendersCount: number;

  @ViewChild(McsFormGroupDirective)
  public set formGroup(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
    this._subscribeToValueChanges();
  }

  constructor(
    _injector: Injector,
    private _activatedRoute: ActivatedRoute,
    private _apiService: McsApiService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
    private _privateChangeExtenderSpeedService: PrivateChangeExtenderSpeedService
  ) {
    super(
      _privateChangeExtenderSpeedService,
      _injector,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'change-private-cloud-launch-extender-speed-go-to-provisioning-step',
          action: 'next-button'
        }
      });
    this._createDesiredSpeedSliderTable();
    this._registerFormGroup();
  }

  public ngOnInit() {
    this._subscribesToQueryParams();
    this._getAllHybridCloudExtenders();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._formGroupSubject);
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

  public get desiredSpeedMin(): number {
    return DEFAULT_MIN_DESIRED_SPEED;
  }

  public get desiredSpeedMax(): number {
    return this.sliderTableSize;
  }

  public get desiredSpeedSliderStep(): number {
    return DEFAULT_STEP_DESIRED_SPEED;
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
  }

  private _setCurrentDesiredSpeed(): number {
    return coerceNumber(getSafeProperty(this.fcExtenderService?.value, (obj) => obj.speedMbps), 10);
  }

  private _getSpeedSliderTableIndex(speed: number): number {
    let index = privateExtenderSpeedSliderDefaultValues.indexOf(speed);
    return index === -1 ? 0 : index;
  }

  private _createDesiredSpeedSliderTable(): void {
    // Create table definitions
    let extenderSpeedScaleTable = new Array<PrivateChangeExtenderSpeed>();
    let tableSize = privateExtenderSpeedSliderDefaultValues.length;
    for (let index = 0; index < tableSize; index++) {
      let desiredSpeedScaleItem = {
        desiredSpeed: privateExtenderSpeedSliderDefaultValues[index]
      } as PrivateChangeExtenderSpeed;
      extenderSpeedScaleTable.push(desiredSpeedScaleItem);
    }
    this.sliderTable = extenderSpeedScaleTable;
    this.sliderTableSize = this.sliderTable.length - 1;
  }

  private _subscribeToValueChanges(): void {
    this._formGroupSubject.next();
    zip(
      this._formGroup.valueChanges(),
      this._formGroup.stateChanges()
    ).pipe(
      takeUntil(this._formGroupSubject),
      filter(() => this.formIsValid),
      tap(() => this._notifyDataChange())
    ).subscribe();
  }

  private _notifyDataChange(): void {
    if (isNullOrEmpty(this.fcExtenderService.value)) { return; }

    this._privateChangeExtenderSpeedService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            itemOrderType: OrderIdType.PrivateChangeLaunchExtenderSpeed,
            referenceId: PRIVATE_CHANGE_EXTENDER_SPEED_REF_ID,
            properties: {
              speedMbps: this.sliderTable[this.desiredSpeedSliderValueIndex].desiredSpeed
            } as ExtenderSpeedProperties,
            serviceId: this.fcExtenderService.value.serviceId
          })
        ]
      })
    );
  }

  /**
   * Event that emits when the extender speed confirm order has been changed
   * @param orderDetails Order details to be set
   */
  public onExtenderSpeedConfirmOrderChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }
    this._privateChangeExtenderSpeedService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        contractDurationMonths: orderDetails.contractDurationMonths,
        description: orderDetails.description,
        billingEntityId: orderDetails.billingEntityId,
        billingSiteId: orderDetails.billingSiteId,
        billingCostCentreId: orderDetails.billingCostCentreId
      }),
      OrderRequester.Billing
    );
    this._privateChangeExtenderSpeedService.submitOrderRequest();
  }

  /**
   * Event that emits when data in submitted from the wizard
   * @param submitDetails order details
   */
  public onSubmitOrder(submitDetails: OrderDetails, extenderServiceId: string): void {
    if (isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourceDescription: this.progressDescription,
      serviceId: extenderServiceId
    };

    this.submitOrderWorkflow(workflow);
  }

  private _registerFormGroup() {
    this.fcExtenderService = new FormControl('', [CoreValidators.required]);

    this.fgextenderServiceDetails = this._formBuilder.group({
      fcExtenderService: this.fcExtenderService
    });
  }

  private _getAllHybridCloudExtenders(): void {
    let queryParam = new McsExtendersQueryParams();
    queryParam.serviceEnd = 'A';

    this.cloudExtenders$ = this._apiService.getExtenders(queryParam).pipe(
      map((response) => {
        let cloudExtenders = getSafeProperty(response, (obj) =>
          obj.collection).filter((service) => service.ExtenderTypeText === extenderTypeText[ExtenderType.ExtenderMtAz]);
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