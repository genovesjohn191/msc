import { JsonProperty } from '@app/utilities';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsOrderColocationStaffEscort {

  @JsonProperty()
  public anttendeeName: string = undefined;

  @JsonProperty()
  public attendeeOrganization: string = undefined;

  @JsonProperty()
  public attendeeJobTitle: string = undefined;

  @JsonProperty()
  public attendeeMobileNumber: string = undefined;

  @JsonProperty()
  public attendeeEmailAddress: string = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public arrivalDate: Date = undefined;

  @JsonProperty()
  public arrivalTime: string = undefined;

  @JsonProperty()
  public exitTime: string = undefined;

  @JsonProperty()
  public workRequired: string = undefined;

  @JsonProperty()
  public toolsRequired: string = undefined;

  @JsonProperty()
  public remoteHandsExceptionReason: string = undefined;

  @JsonProperty()
  public customerReferenceNumber: string = undefined;
}
