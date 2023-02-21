import { JsonProperty } from '@app/utilities';

export class McsSaasBackupAttempt {
  @JsonProperty()
  public type: string = undefined;
}
