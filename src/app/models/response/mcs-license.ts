import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';
import {
  LicenseStatus,
  LicenseStatusSerialization,
  licenseStatusText
} from '../enumerations/license-status.enum';

export class McsLicense extends McsEntityBase {

  @JsonProperty()
  public name: string = undefined;

  @JsonProperty({
    serializer: LicenseStatusSerialization,
    deserializer: LicenseStatusSerialization
  })
  public status: LicenseStatus = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public subscriptionId: string = undefined;

  @JsonProperty()
  public offerId: string = undefined;

  @JsonProperty()
  public unit: string = undefined;

  @JsonProperty()
  public quantity: number = 0;

  @JsonProperty()
  public billingCycle: string = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public renewalDate: Date = undefined;

  @JsonProperty()
  public parentId: string = undefined;

  @JsonProperty()
  public parentServiceId: string = undefined;

  @JsonProperty()
  public pcSubscriptionId: string = undefined;

  public get statusLabel(): string {
    return licenseStatusText[this.status];
  }

  public get isPending(): boolean {
    return this.status === LicenseStatus.Pending;
  }

  public get isSuspended(): boolean {
    return this.status === LicenseStatus.Suspended;
  }
}
