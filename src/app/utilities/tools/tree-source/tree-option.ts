export class TreeOption<TValue> {

  constructor(
    public selectable: boolean = true,
    public disableWhen?: (node: TValue) => boolean,
    public tooltipFunc?: (node: TValue) => string
  ) { }
}
