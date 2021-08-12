import { TreeOption } from './tree-option';

export class TreeGroup<TChildProp> {
  constructor(
    public text: string,
    public value?: any,
    public children?: TChildProp,
    public option?: TreeOption<any>
  ) { }
}
