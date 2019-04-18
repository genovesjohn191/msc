export class McsOrderApprover {
  public userId: string = undefined;
  public firstName: string = undefined;
  public lastName: string = undefined;
  public emailAddress: string = undefined;

  /**
   * Returns the full name of the approver
   */
  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
