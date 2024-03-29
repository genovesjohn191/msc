import {
  zip,
  BehaviorSubject,
  Subject,
  Subscription,
  throwError
} from 'rxjs';
import {
  catchError,
  filter,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
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
  IMcsFormGroup,
  McsOrderWizardBase,
  OrderRequester
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  OrderDetails,
  SmacSharedDetails,
  SmacSharedFormConfig
} from '@app/features-shared';
import {
  DeliveryType,
  HttpStatusCode,
  McsOption,
  McsOrderCreate,
  McsOrderItemCreate,
  McsOrderWorkflow,
  OrderIdType,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsFormGroupDirective } from '@app/shared';
import {
  addDaysToDate,
  createObject,
  getCurrentDate,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition,
  Guid,
  formatStringToText
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { ServerRequestPatchService } from './server-request-patch.service';

const MAX_INSTRUCTIONS_LENGTH = 850;
const VISIBILE_ROWS = 3;
const REQUEST_PATCH_ID = Guid.newGuid().toString();
const LOADING_TEXT = 'Loading';

type PatchRequestProperties = {
  exclusions: '',
  testCases: string[],
  phoneConfirmationRequired: boolean;
  customerReferenceNumber: string;
  notes: string;
};

@Component({
  selector: 'app-remote-hands',
  templateUrl: './server-request-patch.component.html',
  providers: [ServerRequestPatchService]
})
export class ServerRequestPatchComponent  extends McsOrderWizardBase  implements OnInit, OnDestroy {

  public fgRequestPatch: FormGroup<any>;
  public fcServers: FormControl<any>;
  public fcExclusions: FormControl<any>;

  public smacSharedFormConfig$: BehaviorSubject<SmacSharedFormConfig>;
  public managedServers: McsOption[] = [];

  private _formGroup: McsFormGroupDirective;
  private _formGroupSubject = new Subject<void>();
  private _selectedManagedServerHandler: Subscription;
  private _smacSharedDetails: SmacSharedDetails;
  private _errorStatus: number;
  private _serverCount: number;

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get showPermissionErrorFallbackText(): boolean {
    return this._errorStatus === HttpStatusCode.Forbidden;
  }

  public get noServicesToDisplay(): boolean {
    return !isNullOrEmpty(this._errorStatus) || this._serverCount === 0;
  }

  public get noServicesFallbackText(): string {
    if (!this.noServicesToDisplay) { return; }
    return this.showPermissionErrorFallbackText ? 'message.noPermissionFallbackText' : 'message.noServiceToDisplay';
  }

  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  public get maxInstructionsLength(): number {
    return MAX_INSTRUCTIONS_LENGTH;
  }

  public get instructionVisibleRows(): number {
    return VISIBILE_ROWS;
  }

  public get testCasePlaceHolder(): string {
    return this._translateService.instant('serverRequestPatch.detailsStep.testCasesInstructionsPlaceholder');
  }

  public get customerReferenceNumberPlaceHolder(): string {
    return this._translateService.instant('serverRequestPatch.detailsStep.customerReferenceNumberPlaceHolder');
  }

  public get notesHelpText(): string {
    return this._translateService.instant('serverRequestPatch.detailsStep.notesHelpText');
  }

  public get notesLabel(): string {
    return this._translateService.instant('serverRequestPatch.detailsStep.notesLabel');
  }

  public get loadingInProgress(): boolean {
    return this._isLoading;
  }
  public set loadingInProgress(value: boolean) {
    this._isLoading = value;
  }
  private _isLoading = false;

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }
  public get loadingText(): string {
    return LOADING_TEXT;
  }

  @ViewChild(McsFormGroupDirective)
  public set formGroup(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
    this._subscribeToValueChanges();
  }

  @ViewChild('fgSmacSharedForm')
  public set fgSmacSharedForm(value: IMcsFormGroup) {
    if (isNullOrEmpty(value)) { return; }

    let isRegistered = this.fgRequestPatch.contains('fgSmacSharedForm');
    if (isRegistered) { return; }
    this.fgRequestPatch.addControl('fgSmacSharedForm',
      value.getFormGroup().formGroup
    );
  }

  constructor(
    _injector: Injector,
    private _requestPatchService: ServerRequestPatchService,
    private _formBuilder: FormBuilder,
    private _apiService: McsApiService,
    private _eventDispatcher: EventBusDispatcherService,
    private _translateService: TranslateService
  ) {
    super(
      _requestPatchService,
      _injector,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'request-patch-goto-provisioning-step',
          action: 'next-button'
        }
      }
      );
    this._smacSharedDetails = new SmacSharedDetails();
  }


  public ngOnInit(): void {
    this.loadingInProgress = true;
    this._registerFormGroup();
    this._subscribeToManagedServer();
    this._subscribeToSmacSharedFormConfig();
    this._registerEvents();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._formGroupSubject);
    unsubscribeSafely(this._selectedManagedServerHandler);
    unsubscribeSafely(this.smacSharedFormConfig$);unsubscribeSafely(this.smacSharedFormConfig$);
  }

  private _subscribeToSmacSharedFormConfig(): void {
    let testCaseConfig = { isIncluded: true, placeholder: this.testCasePlaceHolder };
    let notesConfig = { isIncluded: true, isRequired: false, label: this.notesLabel, helpText: this.notesHelpText };
    let contactConfig = { isIncluded: true };
    let customerRefConfig = {isIncluded: true, isRequired: false, placeholder: this.customerReferenceNumberPlaceHolder};
    let config = new SmacSharedFormConfig(this._injector, testCaseConfig, notesConfig, contactConfig, customerRefConfig);
    this.smacSharedFormConfig$ = new BehaviorSubject<SmacSharedFormConfig>(config);
  }

  private _subscribeToValueChanges(): void {
    this._formGroupSubject.next();
    zip(
      this._formGroup.valueChanges(),
      this._formGroup.stateChanges()
    ).pipe(
      takeUntil(this._formGroupSubject),
      filter(() => this.formIsValid),
      tap(() => this._onManagedServerChange())
    ).subscribe();
  }

  public onOrderDetailsDataChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }
    this._requestPatchService.createOrUpdateOrder(
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

    this._requestPatchService.submitOrderRequest();
  }

  public onChangeSharedForm(formDetails: SmacSharedDetails): void {
    this._smacSharedDetails = formDetails;
  }


  private _onManagedServerChange(): void {
    this._requestPatchService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            itemOrderType: OrderIdType.ServerRequestPatch,
            referenceId: REQUEST_PATCH_ID,
            serviceId: this.fcServers.value.serviceId,
            deliveryType: DeliveryType.Standard, // set to Standard as default
            schedule: addDaysToDate(getCurrentDate(), 2).toISOString(),
            properties: {
              exclusions: formatStringToText(this.fcExclusions.value),
              testCases: this._smacSharedDetails.testCases,
              phoneConfirmationRequired: this._smacSharedDetails.contactAfterChange,
              customerReferenceNumber: formatStringToText(this._smacSharedDetails.referenceNumber),
              notes: formatStringToText(this._smacSharedDetails.notes)
            } as PatchRequestProperties
          })
        ]
      })
    );
  }

  public onSubmitOrder(submitDetails: OrderDetails, serviceID: string): void {
    if (isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourceDescription: this.progressDescription,
      serviceId: serviceID
    };
    this.submitOrderWorkflow(workflow);
  }

  private _onSelectedServerChange(server: any): void {
    if (isNullOrEmpty(server)) { return; }
    this.fcServers.setValue(server);
  }

  private _registerFormGroup(): void {
    this.fcServers = new FormControl<any>('', [CoreValidators.required]);
    this.fcExclusions = new FormControl<any>('');

    this.fgRequestPatch = this._formBuilder.group({
      fcExclusions: this.fcExclusions,
      fcServers: this.fcServers
    });
  }


  private _registerEvents(): void {
    this._selectedManagedServerHandler = this._eventDispatcher.addEventListener(
      McsEvent.serverRequestPatchSelectedEvent, this._onSelectedServerChange.bind(this));
  }

  private _subscribeToManagedServer(): void {
   this._apiService.getServers()
   .pipe(
     catchError((error) => {
      this.loadingInProgress = false;
      this._errorStatus = error?.details?.status;
      return throwError(error);
     })
   )
   .subscribe(
      (serversCollection) => {
        let servers = getSafeProperty(serversCollection, (obj) => obj.collection) || [];
        servers.forEach((server) => {
          if (!server.isManagedVCloud) { return; }
          this.managedServers.push(createObject(McsOption, { text: server.name, value: server }));
        });
        this.loadingInProgress = false;
        this._serverCount = this.managedServers?.length;
      });
  }
}
