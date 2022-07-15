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

import { PrivateChangeExtenderSpeedService } from './private-change-extender-speed.service';
import {
  ChangeExtenderSpeedInfo,
  ExtenderSpeedConfig
} from '../shared/change-extender-speed';
import { TranslateService } from '@ngx-translate/core';

type ExtenderSpeedProperties = {
  speedMbps: number;
};

const PRIVATE_CHANGE_EXTENDER_SPEED_REF_ID = Guid.newGuid().toString();

@Component({
  selector: 'mcs-order-private-change-extender-speed',
  templateUrl: 'private-change-extender-speed.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PrivateChangeExtenderSpeedService]
})

export class PrivateChangeExtenderSpeedComponent extends McsOrderWizardBase {

  public config: ExtenderSpeedConfig = {
    extenderServiceLabel: this._translate.instant('changeExtenderSpeed.privateCloud.extenderServiceLabel'),
    extenderServiceId: 'private-select-extender-service',
    extenderServiceProductType: ExtenderType.ExtenderMtAz,
    desiredSpeedId: 'private-slider-desired-speed'
  };

  public fgPrivateCloudChangeExtender: FormGroup<any>;

  private _extenderInfo: ChangeExtenderSpeedInfo;

  private _formGroup: McsFormGroupDirective;
  @ViewChild(McsFormGroupDirective)
  public set formGroup(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
  }

  @ViewChild('fgPrivateCloudExtenderSpeed')
  public set _fgPrivateCloudExtenderSpeed(value: IMcsFormGroup) {
    if (isNullOrEmpty(value)) { return; }

    let isRegistered = this.fgPrivateCloudChangeExtender.contains('fgPrivateCloudExtenderSpeed');
    if (isRegistered) { return; }
    this.fgPrivateCloudChangeExtender.addControl('fgPrivateCloudExtenderSpeed',
      value.getFormGroup().formGroup
    );
  }

  constructor(
    _injector: Injector,
    private _formBuilder: FormBuilder,
    private _privateChangeExtenderSpeedService: PrivateChangeExtenderSpeedService,
    private _translate: TranslateService
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

    this._privateChangeExtenderSpeedService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            itemOrderType: OrderIdType.PrivateChangeLaunchExtenderSpeed,
            referenceId: PRIVATE_CHANGE_EXTENDER_SPEED_REF_ID,
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
    this.fgPrivateCloudChangeExtender = this._formBuilder.group([]);
  }
}