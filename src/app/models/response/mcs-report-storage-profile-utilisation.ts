import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import {
  PlatformType,
  PlatformTypeSerialization
} from '../enumerations/platform-type.enum';

export class McsReportStorageResourceUtilisation extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public iops: number = undefined;

  @JsonProperty()
  public enabled: boolean = undefined;

  @JsonProperty()
  public limitMB: number = undefined;

  @JsonProperty()
  public usedMB: number = undefined;

  @JsonProperty()
  public availableMB: number = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public isStretched: boolean = undefined;

  @JsonProperty()
  public serviceChangeAvailable: boolean = undefined;

  @JsonProperty()
  public resourceName: string = undefined;

  @JsonProperty()
  public resourceId: string = undefined;

  @JsonProperty({
    serializer: PlatformTypeSerialization,
    deserializer: PlatformTypeSerialization
  })
  public resourcePlatform: PlatformType = undefined;
}