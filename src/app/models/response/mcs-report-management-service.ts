import { JsonProperty } from '@app/utilities';

export class McsReportManagementService {
  @JsonProperty()
  public id: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public mcaContact: string = undefined;

  @JsonProperty()
  public isEssentials: boolean = undefined;

  @JsonProperty()
  public azureActiveDirectoryDomainName: string = undefined;

  @JsonProperty()
  public linkedSubscription: string = undefined;

  @JsonProperty()
  public serviceId: string = undefined;
}
