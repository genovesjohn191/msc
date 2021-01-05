export class TreeItem<TValue> {
  public text: string;
  public value: TValue;
  public canSelect?: boolean = true;
  public children: TreeItem<TValue>[];

  constructor() {
    this.children = [];
  }
}
