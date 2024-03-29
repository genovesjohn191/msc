import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsContactUs } from './mcs-contact-us';
import {
  CompanyStatus,
  CompanyStatusSerialization
} from '../enumerations/company-status.enum';

export class McsCompany extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public hasHosting: boolean = undefined;

  @JsonProperty()
  public hasData: boolean = undefined;

  @JsonProperty()
  public hasVoice: boolean = undefined;

  @JsonProperty()
  public hasMobile: boolean = undefined;

  @JsonProperty({
    serializer: CompanyStatusSerialization,
    deserializer: CompanyStatusSerialization
  })
  public status: CompanyStatus = undefined;

  @JsonProperty()
  public contacts?: McsContactUs[] = undefined;
}