import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import {
  haModeText,
  HaMode,
  HaModeSerialization
} from '../enumerations/ha-mode.enum';

import {
  extenderTypeText,
  ExtenderType,
  ExtenderTypeSerialization
} from '../enumerations/extender-type.enum';

export class McsExtenderService extends McsEntityBase {

  @JsonProperty()
  public id: string = undefined;

  @JsonProperty()
  public billingDescription: string = undefined;

  @JsonProperty()
  public speedMbps: number = undefined;

  @JsonProperty()
  public serviceEnd: string = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public linkedServiceId: string = undefined;

  @JsonProperty()
  public serviceChangeAvailable: boolean = undefined;

  @JsonProperty({
    serializer: HaModeSerialization,
    deserializer: HaModeSerialization
  })
  public haMode: HaMode = undefined;

  @JsonProperty({
    serializer: ExtenderTypeSerialization,
    deserializer: ExtenderTypeSerialization
  })
  public productType: ExtenderType = undefined;

  /**
   * Returns the HA Mode label
   */
  public get HaModeText(): string {
    return haModeText[this.haMode] ||
           null;
  }

  /**
   * Returns the service type label
   */
  public get ExtenderTypeText(): string {
    return extenderTypeText[this.productType] ||
           null;
  }

  /**
   * Returns the Speed (Mbps) label
   */
  public get speedText(): string {
    let friendlySpeedValue: string = '';
    if (this.speedMbps < 1000)  {
      friendlySpeedValue = String(this.speedMbps) + ' Mbps';
    } else  {
      friendlySpeedValue =  String(this.speedMbps / 1000) + ' Gbps';
    }
    return (this.serviceEnd !== 'A') ?
    null : friendlySpeedValue;
  }
}
