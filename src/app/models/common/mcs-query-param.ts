import {
  convertJsonToMapObject,
  isNullOrEmpty,
  serializeObjectToJson,
  CommonDefinition,
  JsonProperty
} from '@app/utilities';

export class McsQueryParam {
  public set keyword(value: string) {
    this._keyword = value;
  }

  // TO DO: fix issue on order list not showing when returning back to /orders/dashboard page
  public get keyword(): string {
    return isNullOrEmpty(this._keyword) ? '' : this._keyword;
  }
  private _keyword?: string;

  @JsonProperty({ name: 'page' })
  public pageIndex?: number;

  @JsonProperty({ name: 'per_page' })
  public pageSize?: number;

  constructor() {
    this.keyword = '';
    this.pageIndex = CommonDefinition.PAGE_INDEX_DEFAULT;
    this.pageSize = CommonDefinition.PAGE_SIZE_MAX;
  }

  public static convertCustomQueryToParamMap<TQuery>(query: TQuery): Map<string, string> {
    let serializedJson = serializeObjectToJson(query);
    if (isNullOrEmpty(serializedJson)) { return null; }
    return convertJsonToMapObject(serializedJson as any, true);
  }
}
