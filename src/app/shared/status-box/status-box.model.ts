export class StatusBoxAttribute {
  public type: StatusBoxType;
  public title: string;
  public description: string;
  public user: string;
  public dialogState: string;

  constructor () {
    this.type = StatusBoxType.None;
    this.title = '';
    this.description = '';
    this.user = '';
    this.dialogState = '';
  }
}

export enum StatusBoxType {
  None = 0,
  Error = 1,
  OnGoing = 2,
  Success = 3
}
