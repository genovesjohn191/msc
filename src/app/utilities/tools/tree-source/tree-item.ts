import { TreeOption } from './tree-option';

export class TreeItem<TValue> {
  public text: string;
  public value: TValue;
  public children: TreeItem<TValue>[];
  public option?: TreeOption<TValue>;

  constructor() {
    this.children = [];
  }
}
