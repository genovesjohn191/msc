export class McsFilterInfo {
  public id: string;
  public value?: boolean;
  public exclude?: boolean;

  // Default value will be based on
  // id and columnHeader in localization
  public text?: string;
}
