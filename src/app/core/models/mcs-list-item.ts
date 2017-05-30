export class McsListItem {
  public key: string;
  public value: any;

  constructor(
    itemKey: string,
    itemValue: any
  ) {
    this.key = itemKey;
    this.value = itemValue;
  }
}
