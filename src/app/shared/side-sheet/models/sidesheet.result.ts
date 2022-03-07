export enum SideSheetAction {
  None = 0,
  Confirm = 1,
  Cancel = 2
}

export class SideSheetResult<TData> {
  public data?: TData;
  public action: SideSheetAction;
}
