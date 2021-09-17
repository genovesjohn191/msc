import {
  ChangeDetectionStrategy,
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
  Observable,
  of,
  Subject,
  throwError,
  zip
} from 'rxjs';
import {
  catchError,
  filter,
  map,
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import {
  CoreValidators,
  McsOrderWizardBase,
  OrderRequester
} from '@app/core';
import {
  AzureModule,
  azureModuleText,
  HttpStatusCode,
  McsOption,
  McsOrderCreate,
  McsOrderItemCreate,
  McsOrderWorkflow,
  OrderIdType
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsFormGroupDirective } from '@app/shared';
import {
  CommonDefinition,
  createObject,
  getSafeProperty,
  Guid,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { AzureProfessionalServiceRequestService } from './azure-professional-service-request.service';
import { OrderDetails } from '@app/features-shared';

const AZURE_PROFESSIONAL_SERVICE_REQUEST_REF_ID = Guid.newGuid().toString();
const MAX_REQUEST_DETAILS_LENGTH = 850;
const REQUEST_DETAILS_VISIBILE_ROWS = 3;

type AzureProfessionalServicesProperties = {
  azureModule: string,
  requestDescription: string
};

@Component({
  selector: 'mcs-order-azure-professional-service-request',
  templateUrl: 'azure-professional-service-request.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AzureProfessionalServiceRequestService]
})

export class AzureProfessionalServiceRequestComponent extends McsOrderWizardBase implements OnInit, OnDestroy {

  public fgProfessionalService: FormGroup;
  public fcManagementService: FormControl;
  public fcAzureModule: FormControl;
  public fcRequestDetails: FormControl;

  public managementService$: Observable<McsOption[]>;
  public azureModuleOptions$: Observable<McsOption[]>;

  private _errorStatus: number;
  private _managementServiceCount: number;

  private _formGroup: McsFormGroupDirective;
  private _valueChangesSubject = new Subject<void>();

  @ViewChild(McsFormGroupDirective)
  public set formGroup(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
    this._subscribeToFormValueChanges();
  }

  constructor(
    _injector: Injector,
    private _apiService: McsApiService,
    private _azureProfessionalServiceRequestService: AzureProfessionalServiceRequestService,
    private _formBuilder: FormBuilder,
    private _translate: TranslateService,
  ) {
    super(
      _azureProfessionalServiceRequestService,
      _injector,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'azure-professional-service-request-go-to-provisioning-step',
          action: 'next-button'
        }
    });
    this._registerFormGroup();
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get maxRequestDetailsLength(): number {
    return MAX_REQUEST_DETAILS_LENGTH;
  }

  public get requestDetailsVisibleRows(): number {
    return REQUEST_DETAILS_VISIBILE_ROWS;
  }

  public get azureModuleEnum(): any {
    return AzureModule;
  }

  public get showPermissionErrorFallbackText(): boolean {
    return this._errorStatus === HttpStatusCode.Forbidden;
  }

  public get noServicesToDisplay(): boolean {
    return !isNullOrEmpty(this._errorStatus) || this._managementServiceCount === 0;;
  }

  public get noServicesFallbackText(): string {
    if (!this.noServicesToDisplay) { return; }
    return this.showPermissionErrorFallbackText ? 'message.noPermissionFallbackText' : 'message.noServiceToDisplay';
  }

  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  public ngOnInit() {
    this._getManagementServices();
    this._getAzureModuleOptions();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._valueChangesSubject);
  }

  public onOrderDetailsDataChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }
    this._azureProfessionalServiceRequestService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        contractDurationMonths: orderDetails.contractDurationMonths,
        description: orderDetails.description,
        billingEntityId: orderDetails.billingEntityId,
        billingSiteId: orderDetails.billingSiteId,
        billingCostCentreId: orderDetails.billingCostCentreId
      }),
      OrderRequester.Billing,
      orderDetails.deliveryType,
      orderDetails.schedule
    );

    this._azureProfessionalServiceRequestService.submitOrderRequest();
  }

  public onSubmitOrder(submitDetails: OrderDetails): void {
    if (isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourceDescription: this.progressDescription,
      serviceId: this.fcManagementService?.value?.serviceId
    };
    this.submitOrderWorkflow(workflow);
  }

  private _registerFormGroup(): void {
    this.fcManagementService = new FormControl('', []);
    this.fcAzureModule = new FormControl('', [CoreValidators.required]);
    this.fcRequestDetails = new FormControl('', [CoreValidators.required]);

    this.fgProfessionalService = this._formBuilder.group({
      fcManagementService: this.fcManagementService,
      fcAzureModule: this.fcAzureModule,
      fcRequestDetails: this.fcRequestDetails
    });
  }

  private _subscribeToFormValueChanges(): void {
    this._valueChangesSubject.next();
    zip(
      this._formGroup.valueChanges(),
      this._formGroup.stateChanges()
    ).pipe(
      takeUntil(this._valueChangesSubject),
      filter(() => this.formIsValid),
      tap(() => this.notifyDataChange())
    ).subscribe();
  }

  private notifyDataChange() {
    this._azureProfessionalServiceRequestService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            parentServiceId: this.fcManagementService.value?.serviceId || null,
            itemOrderType: OrderIdType.AzureProfessionalServiceRequest,
            referenceId: AZURE_PROFESSIONAL_SERVICE_REQUEST_REF_ID,
            description: this._translate.instant('orderAzureProfessionalServiceRequest.payload.description'),
            properties: {
              azureModule: azureModuleText[this.fcAzureModule.value],
              requestDescription: this.fcRequestDetails.value
            } as AzureProfessionalServicesProperties
          })
        ]
      })
    );
  }

  private _getManagementServices(): void {
    this.managementService$ = this._apiService.getManagementServices().pipe(
      map((servicesCollection) => {
        let services = getSafeProperty(servicesCollection, (obj) => obj.collection) || [];
        let servicesOptions: McsOption[] = [];
        services.forEach((service) => {
          servicesOptions.push(createObject(McsOption, {
            text: `${service.description} - ${service.serviceId}`,
            value: service
          }));
        });
        this._managementServiceCount = servicesOptions?.length;
        return servicesOptions;
      }),
      shareReplay(1),
      catchError((error) => {
        this._errorStatus = error?.details?.status;
        return throwError(error);
      })
    );
  }

  private _getAzureModuleOptions(): void {
    this.azureModuleOptions$ = of(this._mapEnumToOption(this.azureModuleEnum, azureModuleText));
  }

  private _mapEnumToOption(enumeration: AzureModule, enumText: any): McsOption[] {
    let options = Object.values(enumeration)
      .filter((objValue) => (typeof objValue === 'number'))
      .map(objValue => createObject(McsOption, { text: enumText[objValue], value: objValue }));
    return options;
  }
}