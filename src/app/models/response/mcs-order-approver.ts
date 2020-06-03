import { JsonProperty } from '@app/utilities';

export class McsOrderApprover {
  @JsonProperty()
  public userId: string = undefined;

  @JsonProperty()
  public firstName: string = undefined;

  @JsonProperty()
  public lastName: string = undefined;

  @JsonProperty()
  public emailAddress: string = undefined;

  /**
   * Returns the full name of the approver
   */
  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
