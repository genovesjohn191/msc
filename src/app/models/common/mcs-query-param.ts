import {
  convertJsonToMapObject,
  isNullOrEmpty,
  serializeObjectToJson,
  CommonDefinition,
  JsonProperty
} from '@app/utilities';

export class McsQueryParam {
  public set keyword(value: string) {
    this.search_keyword = value;
  }

  // TO DO: fix issue on order list not showing when returning back to /orders/dashboard page
  public get keyword(): string {
    return isNullOrEmpty(this.search_keyword) ? '' : this.search_keyword;
  }
  private search_keyword?: string;

  @JsonProperty({ name: 'page' })
  public pageIndex?: number;

  @JsonProperty({ name: 'per_page' })
  public pageSize?: number;

  @JsonProperty({ name: 'sort_direction' })
  public sortDirection?: string;

  @JsonProperty({ name: 'sort_field' })
  public sortField?: string;

  constructor() {
    this.keyword = '';
    this.pageIndex = CommonDefinition.PAGE_INDEX_DEFAULT;
    this.pageSize = CommonDefinition.PAGE_SIZE_MAX;
    this.sortDirection = '';
    this.sortField = '';
  }

  public static convertCustomQueryToParamMap<TQuery>(query: TQuery): Map<string, string> {
    let serializedJson = serializeObjectToJson(query);
    if (isNullOrEmpty(serializedJson)) { return null; }
    return convertJsonToMapObject(serializedJson as any, true);
  }
}
