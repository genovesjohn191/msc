import {
  zip,
  Subject,
  Subscription,
  throwError,
  forkJoin
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
  McsOrderWizardBase,
  OrderRequester
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import {
  OrderDetails
} from '@app/features-shared';
import {
  DeliveryType,
  HttpStatusCode,
  McsOption,
  McsOptionGroup,
  McsOrderCreate,
  McsOrderItemCreate,
  McsOrderWorkflow,
  OrderIdType,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsFormGroupDirective } from '@app/shared';
import {
  createObject,
  getCurrentDate,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition,
  Guid,
  addYearsToDate,
  formatStringToText
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { BackupRestoreRequestService } from './backup-restore-request.service';

const MAX_INSTRUCTIONS_LENGTH = 850;
const VISIBILE_ROWS = 3;
const RESTORE_BACKUP_ID = Guid.newGuid().toString();
const LOADING_TEXT = 'Loading';
const MIN_DATE = addYearsToDate(getCurrentDate(), -7);

type BackupRestoreRequestProperties = {
  restoreFromDate?: Date,
  dataRequired: string,
  restoreDestination: string;
  customerReferenceNumber: string;
};

@Component({
  selector: 'mcs-order-backup-restore-request',
  templateUrl: './backup-restore-request.component.html',
  providers: [BackupRestoreRequestService]
})
export class BackupRestoreRequestComponent extends McsOrderWizardBase implements OnInit, OnDestroy {

  public fgBackupRestoreRequest: FormGroup<any>;
  public fcService: FormControl<any>;
  public fcRestoreFromDate: FormControl<any>;
  public fcDataRequired: FormControl<string>;
  public fcRestoreDestination: FormControl<string>;
  public fcReferenceNumber: FormControl<string>;

  public groupedBackupServices: McsOptionGroup[] = [];

  private _formGroup: McsFormGroupDirective;
  private _formGroupSubject = new Subject<void>();
  private _selectedManagedServerHandler: Subscription;
  private _errorStatus: number;
  private _backupServicesCount: number;

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get showPermissionErrorFallbackText(): boolean {
    return this._errorStatus === HttpStatusCode.Forbidden;
  }

  public get noServicesToDisplay(): boolean {
    return !isNullOrEmpty(this._errorStatus) || this._backupServicesCount === 0;
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

  public get minDate(): Date {
    return MIN_DATE;
  }

  public get maxDate(): Date {
    return getCurrentDate();
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

  public get billingDescFallback(): string {
    return this._translateService.instant('orderBackupRestoreRequest.detailsStep.service.optionBillingDescFallback');
  }

  public get serviceIdFallback(): string {
    return this._translateService.instant('orderBackupRestoreRequest.detailsStep.service.optionServiceIdFallback');
  }

  public get serverNameFallback(): string {
    return this._translateService.instant('orderBackupRestoreRequest.detailsStep.service.optionServerNameFallback');
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

  constructor(
    _injector: Injector,
    private _backupRestoreRequestService: BackupRestoreRequestService,
    private _formBuilder: FormBuilder,
    private _apiService: McsApiService,
    private _eventDispatcher: EventBusDispatcherService,
    private _translateService: TranslateService
  ) {
    super(
      _backupRestoreRequestService,
      _injector,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'backup-restore-request-goto-provisioning-step',
          action: 'next-button'
        }
      }
    );
  }

  public ngOnInit(): void {
    this.loadingInProgress = true;
    this._registerFormGroup();
    this._subscribeToServices();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._formGroupSubject);
    unsubscribeSafely(this._selectedManagedServerHandler);
  }

  private _subscribeToValueChanges(): void {
    this._formGroupSubject.next();
    zip(
      this._formGroup.valueChanges(),
      this._formGroup.stateChanges()
    ).pipe(
      takeUntil(this._formGroupSubject),
      filter(() => this.formIsValid),
      tap(() => this.notifyDataChange()
      )
    ).subscribe();
  }

  public onOrderDetailsDataChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }
    this._backupRestoreRequestService.createOrUpdateOrder(
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

    this._backupRestoreRequestService.submitOrderRequest();
  }

  private notifyDataChange(): void {
    this._backupRestoreRequestService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            itemOrderType: OrderIdType.RestoreBackupRequest,
            referenceId: RESTORE_BACKUP_ID,
            serviceId: this.fcService.value,
            deliveryType: DeliveryType.Standard,
            properties: {
              restoreFromDate: this.fcRestoreFromDate.value,
              dataRequired: formatStringToText(this.fcDataRequired.value),
              restoreDestination: formatStringToText(this.fcRestoreDestination.value),
              customerReferenceNumber: formatStringToText(this.fcReferenceNumber.value),
            } as BackupRestoreRequestProperties
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

  private _registerFormGroup(): void {
    this.fcService = new FormControl<any>('', [CoreValidators.required]);
    this.fcRestoreFromDate = new FormControl<any>('', [CoreValidators.required]);
    this.fcDataRequired = new FormControl<string>('', [CoreValidators.required]);
    this.fcRestoreDestination = new FormControl<string>('', [CoreValidators.required]);
    this.fcReferenceNumber = new FormControl<string>('');

    this.fgBackupRestoreRequest = this._formBuilder.group({
      fcService: this.fcService,
      fcDataRequired: this.fcDataRequired,
      fcRestoreFromDate: this.fcRestoreFromDate,
      fcRestoreDestination: this.fcRestoreDestination,
      fcReferenceNumber: this.fcReferenceNumber
    });
  }

  private _subscribeToServices(): void {
    this._backupServicesCount = 0;
    let combinedCalls = forkJoin([
      this._apiService.getServerBackupServers(),
      this._apiService.getServerBackupVms()
    ]);

    combinedCalls.pipe(
      catchError((error) => {
        this.loadingInProgress = false;
        this._errorStatus = error?.details?.status;
        return throwError(error);
      }),
      tap((results) => {
        let backupServers = getSafeProperty(results[0], (obj) => obj.collection) || [];
        let backupVMs = getSafeProperty(results[1], (obj) => obj.collection) || [];
        let backupServerOptions: McsOption[] = [];
        let backupVmOptions: McsOption[] = [];

        // Set back up server options
        backupServers.forEach((backupServer) => {
          let billingDescText = backupServer.billingDescription ? backupServer.billingDescription : this.billingDescFallback;
          let serviceIdText = backupServer.serviceId ? backupServer.serviceId : this.serviceIdFallback;
          backupServerOptions.push(createObject(McsOption, {
            text: `${billingDescText} (${serviceIdText})`,
            value: backupServer.serviceId,
            helpText: backupServer.serverName,
            disabled: !backupServer.serviceChangeAvailable
          }));
        });

        // Set back up VM options
        backupVMs.forEach((backupVM) => {
          let billingDescText = backupVM.billingDescription ? backupVM.billingDescription : this.billingDescFallback;
          let serviceIdText = backupVM.serviceId ? backupVM.serviceId : this.serviceIdFallback;
          backupVmOptions.push(createObject(McsOption, {
            text: `${billingDescText} (${serviceIdText})`,
            value: backupVM.serviceId,
            helpText: backupVM.serverName,
            disabled: !backupVM.serviceChangeAvailable
          }));
        });

        // Set group options
        this.groupedBackupServices.push(createObject(McsOptionGroup, { groupName: 'Server Backup', options: backupServerOptions }));
        this.groupedBackupServices.push(createObject(McsOptionGroup, { groupName: 'VM Backup', options: backupVmOptions }));
        this.loadingInProgress = false;
        this._backupServicesCount = backupServerOptions?.length + backupVmOptions?.length;
      })
    )
    .subscribe();
  }
}
