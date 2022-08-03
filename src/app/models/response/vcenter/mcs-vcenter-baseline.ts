import { JsonProperty } from '@app/utilities';

import { McsEntityBase } from '../../common/mcs-entity.base';
import { McsDateSerialization } from '../../serialization/mcs-date-serialization';
import { McsVCenter } from './mcs-vcenter';
import { McsVCenterBaselineComplianceSet } from './mcs-vcenter-baseline-compliance-set';

export class McsVCenterBaseline extends McsEntityBase {
  @JsonProperty({
    target: McsVCenterBaselineComplianceSet
  })
  public complianceSet: McsVCenterBaselineComplianceSet[] = undefined;

  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public targetType: string = undefined;

  @JsonProperty()
  public baselineContentType: string = undefined;

  @JsonProperty()
  public baselineType: string = undefined;

  @JsonProperty()
  public isSystemDefined: boolean = undefined;

  @JsonProperty()
  public targetComponent: string = undefined;

  @JsonProperty()
  public uid: string = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public lastUpdateTime: Date = undefined;

  @JsonProperty()
  public approved: boolean = undefined;

  @JsonProperty({
    target: McsVCenter
  })
  public vCenter: McsVCenter = undefined;

  @JsonProperty()
  public hosts: string[] = undefined;
}

