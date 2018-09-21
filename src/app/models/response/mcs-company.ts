import { JsonProperty } from 'json-object-mapper';
import { McsEntityBase } from '../mcs-entity.base';
import {
  McsCompanyStatus,
  McsCompanyStatusSerialization
} from '@app/models';

export class McsCompany extends McsEntityBase  {
  public name: string;
  public hasHosting: boolean;
  public hasData: boolean;
  public hasVoice: boolean;
  public hasMobile: boolean;

  @JsonProperty({
    type: McsCompanyStatus,
    serializer: McsCompanyStatusSerialization,
    deserializer: McsCompanyStatusSerialization
  })
  public status: McsCompanyStatus;

  constructor() {
    super();
    this.name = undefined;
    this.hasHosting = undefined;
    this.hasData = undefined;
    this.hasVoice = undefined;
    this.hasMobile = undefined;
    this.status = undefined;
  }
}
