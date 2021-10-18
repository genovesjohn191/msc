import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input
} from '@angular/core';
import {
  McsOrderItemType,
  McsResource,
  OrderIdType,
  RouteKey
} from '@app/models';
import {
  CommonDefinition,
  isNullOrEmpty
} from '@app/utilities';
@Component({
  selector: 'mcs-change-requests-widget',
  templateUrl: './change-requests-widget.component.html',
  styleUrls: ['../report-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})

export class ChangeRequestWidgetComponent {
  @Input()
    public isPrivateCloud: boolean;

  @Input()
    public orderItemTypes: McsOrderItemType[];

  @Input()
    public vdcList: McsResource[];

  constructor() { }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public get orderIdTypeEnum(): any {
    return OrderIdType;
  }

  public get azureServiceRequestIcon(): string {
    return CommonDefinition.ASSETS_SVG_SMALL_DOCUMENT_CONFIG_BLACK;
  }

  public get changeLicenseCountIcon(): string {
    return CommonDefinition.ASSETS_SVG_SMALL_DOCUMENT_NEW_BLACK;
  }

  public get createNewServerIcon(): string {
    return CommonDefinition.ASSETS_SVG_SMALL_ADD_BOX_BLACK;
  }

  public get expandStorageIcon(): string {
    return CommonDefinition.ASSETS_SVG_SMALL_EXPAND_BLACK;
  }

  public get customChangeIcon(): string {
    return CommonDefinition.ASSETS_SVG_SMALL_LIST_ALT_BLACK;
  }

  public get changeDnsZoneIcon(): string {
    return CommonDefinition.ASSETS_SVG_SMALL_DOCUMENT_BLACK;
  }

  public get hasVdc(): boolean {
    return this.vdcList?.length > 0;
  }

  public get hasManagedVdc(): boolean {
    if (!this.hasVdc) { return false; }
    let vdcManagedFound = this.vdcList.filter((vdc) => !vdc.isSelfManaged);
    return !isNullOrEmpty(vdcManagedFound);
  }

  public getOrderTypeProductId(orderName: string): string {
    if (isNullOrEmpty(this.orderItemTypes)) { return; }
    let orderTypeFound: McsOrderItemType;
    orderTypeFound = this.orderItemTypes.find((order) => order.productOrderType === orderName);
    return orderTypeFound.productId;
  }
}
