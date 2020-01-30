import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ViewChild,
  Injector,
  ChangeDetectorRef
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl
} from '@angular/forms';
import {
  takeUntil,
  map,
  concatMap,
  filter,
  tap
} from 'rxjs/operators';
import {
  Observable,
  Subject,
  zip
} from 'rxjs';
import {
  McsOrderWizardBase,
  CoreValidators,
  OrderRequester
} from '@app/core';
import {
  McsServer,
  McsOrderWorkflow,
  McsOrderCreate,
  McsOption,
  HidsProtectionLevel,
  hidsProtectionLevelText,
  McsOrderItemCreate,
  OrderIdType,
  McsOrderServerHidsAdd
} from '@app/models';
import { McsFormGroupDirective } from '@app/shared';
import { McsApiService } from '@app/services';
import {
  unsubscribeSafely,
  CommonDefinition,
  getSafeProperty,
  isNullOrEmpty,
  createObject,
  Guid
} from '@app/utilities';
import { OrderDetails } from '@app/features-shared';
import { AddHidsService } from './add-hids.service';

interface HidsServers {
  provisioned: boolean;
  server: McsServer;
}

const SERVER_ADD_HIDS_REF_ID = Guid.newGuid().toString();
@Component({
  selector: 'mcs-add-hids',
  templateUrl: 'add-hids.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AddHidsService]
})

export class AddHidsComponent extends McsOrderWizardBase implements OnInit, OnDestroy {
  public resources$: Observable<Map<string, HidsServers[]>>;

  public fgAddHidsDetails: FormGroup;
  public fcServer: FormControl;
  public fcProtectionLevel: FormControl;
  public protectionLevelOptions: McsOption[] = [];

  @ViewChild(McsFormGroupDirective, { static: false })
  public set formGroup(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
    this._subscribeToValueChanges();
  }
  private _formGroup: McsFormGroupDirective;

  private _valueChangesSubject = new Subject<void>();

  constructor(
    _injector: Injector,
    private _formBuilder: FormBuilder,
    private _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
    private _addHidsService: AddHidsService
  ) {
    super(_injector, _addHidsService);
    this._registerFormGroups();
  }

  public ngOnInit() {
    this._initializeProtectionLevelOptions();
    this._subscribeToManagedCloudServers();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._valueChangesSubject);
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  public onSubmitHidsDetails(server: McsServer): void {
    if (isNullOrEmpty(server)) { return; }
    this._changeDetectorRef.markForCheck();
  }

  public onSubmitOrder(submitDetails: OrderDetails, server: McsServer): void {
    if (isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourceDescription: this.progressDescription,
      serviceId: server.serviceId
    };
    this.submitOrderWorkflow(workflow);
  }

  public onAddHidsConfirmOrderChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }
    this._addHidsService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        contractDurationMonths: orderDetails.contractDurationMonths,
        description: orderDetails.description,
        billingEntityId: orderDetails.billingEntityId,
        billingSiteId: orderDetails.billingSiteId,
        billingCostCentreId: orderDetails.billingCostCentreId
      }),
      OrderRequester.Billing
    );
    this._addHidsService.submitOrderRequest();
  }

  public isResourcesEmpty(resourcesMap: Map<string, HidsServers[]>): boolean {
    return resourcesMap.size <= 0;
  }

  private _subscribeToValueChanges(): void {
    this._valueChangesSubject.next();
    zip(
      this._formGroup.valueChanges(),
      this._formGroup.stateChanges()
    ).pipe(
      takeUntil(this._valueChangesSubject),
      filter(() => this.formIsValid),
      tap(() => this._onServerHidsFormChange())
    ).subscribe();
  }

  private _onServerHidsFormChange(): void {
    let server = getSafeProperty(this.fcServer, (obj) => obj.value);
    let protectionLevelValue = getSafeProperty(this.fcProtectionLevel, (obj) => obj.value);

    this._addHidsService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            itemOrderType: OrderIdType.AddHids,
            referenceId: SERVER_ADD_HIDS_REF_ID,
            parentServiceId: server.serviceId,
            properties: createObject(McsOrderServerHidsAdd, {
              protectionLevel: protectionLevelValue,
            })
          })]
      })
    );
  }

  private _subscribeToManagedCloudServers(): void {
    let resourceMap: Map<string, HidsServers[]> = new Map();
    this.resources$ = this._apiService.getServerHostSecurityHids().pipe(
      concatMap((serversHids) => {

        return this._apiService.getServers().pipe(
          map((servers) => {
            servers.collection.filter((server) => server.canProvision).forEach((server) => {

              let serverHidsProvisioned = serversHids.collection.find((serverAv) => serverAv.serverId === server.id);
              let resourceIsExisting = resourceMap.has(server.platform.resourceName);
              if (resourceIsExisting) {
                resourceMap.get(server.platform.resourceName).push({ provisioned: !isNullOrEmpty(serverHidsProvisioned), server });
                return;
              }
              resourceMap.set(server.platform.resourceName, [{ provisioned: !isNullOrEmpty(serverHidsProvisioned), server }]);
            });
            return resourceMap;
          })
        );
      })
    );
  }

  private _initializeProtectionLevelOptions(): void {
    this.protectionLevelOptions.push(new McsOption(HidsProtectionLevel.Protect, hidsProtectionLevelText[HidsProtectionLevel.Protect]));
    this.protectionLevelOptions.push(new McsOption(HidsProtectionLevel.Detect, hidsProtectionLevelText[HidsProtectionLevel.Detect]));
  }

  private _registerFormGroups() {
    this.fcServer = new FormControl('', [CoreValidators.required]);
    this.fcProtectionLevel = new FormControl(HidsProtectionLevel.Detect, [CoreValidators.required]);

    this.fgAddHidsDetails = this._formBuilder.group({
      fcServer: this.fcServer,
      fcProtectionLevel: this.fcProtectionLevel,
    });
  }
}
