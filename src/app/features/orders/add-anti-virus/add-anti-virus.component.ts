import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ViewChild,
  Injector,
  ElementRef,
  ChangeDetectorRef
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl
} from '@angular/forms';
import {
  Observable,
  Subject
} from 'rxjs';
import {
  takeUntil,
  map,
  concatMap
} from 'rxjs/operators';
import {
  McsOrderWizardBase,
  McsFormGroupService,
  CoreValidators,
  OrderRequester
} from '@app/core';
import {
  McsServer,
  McsOrderWorkflow,
  McsOrderCreate,
  McsOrderItemCreate,
  OrderIdType
} from '@app/models';
import { McsFormGroupDirective } from '@app/shared';
import { OrderDetails } from '@app/features-shared';
import { McsApiService } from '@app/services';
import {
  unsubscribeSafely,
  CommonDefinition,
  getSafeProperty,
  isNullOrEmpty,
  createObject,
  Guid
} from '@app/utilities';
import { AddAntiVirusService } from './add-anti-virus.service';

interface AntiVirusServers {
  provisioned: boolean;
  server: McsServer;
}

const SERVER_ADD_ANTI_VIRUS_REF_ID = Guid.newGuid().toString();
@Component({
  selector: 'mcs-add-anti-virus',
  templateUrl: 'add-anti-virus.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AddAntiVirusService]
})

export class AddAntiVirusComponent extends McsOrderWizardBase implements OnInit, OnDestroy {
  public resources$: Observable<Map<string, AntiVirusServers[]>>;

  public fgAddAntiVirusDetails: FormGroup;
  public fcServer: FormControl;

  @ViewChild(McsFormGroupDirective, { static: false })
  private _formGroup: McsFormGroupDirective;

  private _destroySubject = new Subject<void>();

  constructor(
    _injector: Injector,
    private _elementRef: ElementRef,
    private _formBuilder: FormBuilder,
    private _formGroupService: McsFormGroupService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
    private _addAntiVirusService: AddAntiVirusService
  ) {
    super(_injector, _addAntiVirusService);
    this._registerFormGroups();
  }

  public ngOnInit() {
    this._subscribeToManagedCloudServers();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  public onChangeServer(server: McsServer): void {
    if (isNullOrEmpty(server)) { return; }
    this._addAntiVirusService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            itemOrderType: OrderIdType.AddAntiVirus,
            referenceId: SERVER_ADD_ANTI_VIRUS_REF_ID,
            parentServiceId: server.serviceId,
            properties: {}
          })
        ]
      })
    );
  }

  public onSubmitAntiVirusDetails(server: McsServer): void {
    if (isNullOrEmpty(server)) { return; }
    this._changeDetectorRef.markForCheck();
  }

  public onSubmitOrder(submitDetails: OrderDetails, server: McsServer): void {
    if (!this._validateFormFields()) { return; }
    if (isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourceDescription: this.progressDescription,
      serviceId: server.serviceId
    };

    this.submitOrderWorkflow(workflow);
  }

  public onAddAntiVirusConfirmOrderChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }
    this._addAntiVirusService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        contractDurationMonths: orderDetails.contractDurationMonths,
        description: orderDetails.description,
        billingEntityId: orderDetails.billingEntityId,
        billingSiteId: orderDetails.billingSiteId,
        billingCostCentreId: orderDetails.billingCostCentreId
      }),
      OrderRequester.Billing
    );
    this._addAntiVirusService.submitOrderRequest();
  }

  private _subscribeToManagedCloudServers(): void {
    let resourceMap: Map<string, AntiVirusServers[]> = new Map();
    this.resources$ = this._apiService.getServerHostSecurityAntiVirus().pipe(
      concatMap((serversAv) => {

        return this._apiService.getServers().pipe(
          map((servers) => {
            servers.collection.filter((server) => server.canProvision).forEach((server) => {

              let serverAvProvisioned = serversAv.collection.find((serverAv) => serverAv.serverId === server.id);
              let resourceIsExisting = resourceMap.has(server.platform.resourceName);
              if (resourceIsExisting) {
                resourceMap.get(server.platform.resourceName).push({ provisioned: !isNullOrEmpty(serverAvProvisioned), server });
                return;
              }
              resourceMap.set(server.platform.resourceName, [{ provisioned: !isNullOrEmpty(serverAvProvisioned), server }]);
            });
            return resourceMap;
          })
        );
      })
    );
  }

  private _validateFormFields(): boolean {
    if (this.formIsValid) { return true; }
    this._touchInvalidFields();
    return false;
  }

  private _touchInvalidFields(): void {
    this._formGroupService.touchAllFormFields(this.fgAddAntiVirusDetails);
    this._formGroupService.scrollToFirstInvalidField(this._elementRef.nativeElement);
  }

  private _registerFormGroups() {
    this.fgAddAntiVirusDetails = this._formBuilder.group([]);
    this.fcServer = new FormControl('', [CoreValidators.required]);

    this.fgAddAntiVirusDetails = new FormGroup({
      fcServer: this.fcServer
    });

    this.fgAddAntiVirusDetails.valueChanges.pipe(
      takeUntil(this._destroySubject)
    ).subscribe();
  }
}
