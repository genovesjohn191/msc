import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormGroup
} from '@angular/forms';
import {
  IMcsFormGroup,
  McsOrderWizardBase,
  OrderRequester
} from '@app/core';
import { OrderDetails } from '@app/features-shared';
import {
  ExtenderType,
  extenderTypeText,
  McsOrderCreate,
  McsOrderItemCreate,
  McsOrderWorkflow,
  OrderIdType
} from '@app/models';
import { McsFormGroupDirective } from '@app/shared';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  CommonDefinition,
  Guid
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import {
  ChangeExtenderSpeedInfo,
  ExtenderSpeedConfig
} from '../shared/change-extender-speed';
import { AzureExtendSpeedService } from './azure-extend-speed.service';

type ExtenderSpeedProperties = {
  speedMbps: number;
};

const AZURE_EXTEND_SPEED_SPEED_REF_ID = Guid.newGuid().toString();

@Component({
  selector: 'mcs-order-azure-extend-speed',
  templateUrl: 'azure-extend-speed.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AzureExtendSpeedService]
})

export class AzureExtendSpeedComponent extends McsOrderWizardBase {

  public config: ExtenderSpeedConfig = {
    extenderServiceLabel: this._translate.instant('changeExtenderSpeed.azure.extenderServiceLabel'),
    extenderServiceId: 'azure-extend-select-extender-service',
    extenderServiceProductType: extenderTypeText[ExtenderType.PublicCloudExtenderMtAz],
    desiredSpeedId: 'azure-extend-slider-desired-speed'
  };

  public fgChangeAzureExtend: FormGroup<any>;

  private _extenderInfo: ChangeExtenderSpeedInfo;

  private _formGroup: McsFormGroupDirective;
  @ViewChild(McsFormGroupDirective)
  public set formGroup(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
  }

  @ViewChild('fgAzureExtenderSpeed')
  public set _fgAzureExtenderSpeed(value: IMcsFormGroup) {
    if (isNullOrEmpty(value)) { return; }

    let isRegistered = this.fgChangeAzureExtend.contains('fgAzureExtenderSpeed');
    if (isRegistered) { return; }
    this.fgChangeAzureExtend.addControl('fgAzureExtenderSpeed',
      value.getFormGroup().formGroup
    );
  }

  constructor(
    _injector: Injector,
    private _formBuilder:FormBuilder,
    private _changeAzureExtendSpeedService: AzureExtendSpeedService,
    private _translate: TranslateService
  ) {
    super(
      _changeAzureExtendSpeedService,
      _injector,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'change-azure-extend-speed-go-to-provisioning-step',
          action: 'next-button'
        }
      });
    this._registerFormGroup();
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid()) && this._extenderInfo.speedHasChanged;
  }

  public notifyDataChange(extender?: ChangeExtenderSpeedInfo): void {
    if (isNullOrEmpty(extender.serviceId)) { return; }
    this._extenderInfo = extender;

    this._changeAzureExtendSpeedService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            itemOrderType: OrderIdType.ChangeAzureExtendSpeed,
            referenceId: AZURE_EXTEND_SPEED_SPEED_REF_ID,
            properties: {
              speedMbps: extender.desiredSpeed
            } as ExtenderSpeedProperties,
            serviceId: extender.serviceId
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
    this._changeAzureExtendSpeedService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        contractDurationMonths: orderDetails.contractDurationMonths,
        description: orderDetails.description,
        billingEntityId: orderDetails.billingEntityId,
        billingSiteId: orderDetails.billingSiteId,
        billingCostCentreId: orderDetails.billingCostCentreId
      }),
      OrderRequester.Billing
    );
    this._changeAzureExtendSpeedService.submitOrderRequest();
  }

  /**
   * Event that emits when data in submitted from the wizard
   * @param submitDetails order details
   */
  public onSubmitOrder(submitDetails: OrderDetails): void {
    if (isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourceDescription: this.progressDescription,
      serviceId: this._extenderInfo.serviceId
    };

    this.submitOrderWorkflow(workflow);
  }

  private _registerFormGroup() {
    this.fgChangeAzureExtend = this._formBuilder.group([]);
  }
}