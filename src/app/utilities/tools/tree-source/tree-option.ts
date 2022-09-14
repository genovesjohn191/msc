export class TreeOption<TValue> {
  public selectable: boolean = true;
  public subscript?: string;
  public disableWhen?: (node: TValue) => boolean;
  public tooltipFunc?: (node: TValue) => string;

  /**
   * This would exclude the item in the selected items emitted.
   */
  public excludeFromSelection?: boolean;
}
