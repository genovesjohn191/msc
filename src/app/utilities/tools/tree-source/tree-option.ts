export class TreeOption<TValue> {
  public selectable: boolean = true;
  public excludeFromSelection?: boolean;  // This will only included once selectable is true
  public disableWhen?: (node: TValue) => boolean;
  public tooltipFunc?: (node: TValue) => string;
}
