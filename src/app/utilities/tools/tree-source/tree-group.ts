export class TreeGroup<TChildProp> {
  constructor(
    public text: string,
    public value?: any,
    public children?: TChildProp,
    public selectable: boolean = true
  ) { }
}
