import { JsonProperty } from 'json-object-mapper';
import { McsEntityBase } from '../mcs-entity.base';
import {
  CompanyStatus,
  CompanyStatusSerialization
} from '../enumerations/company-status.enum';

export class McsCompany extends McsEntityBase  {
  public name: string;
  public hasHosting: boolean;
  public hasData: boolean;
  public hasVoice: boolean;
  public hasMobile: boolean;

  @JsonProperty({
    type: CompanyStatus,
    serializer: CompanyStatusSerialization,
    deserializer: CompanyStatusSerialization
  })
  public status: CompanyStatus;

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
