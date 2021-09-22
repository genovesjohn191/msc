import {
  convertJsonToMapObject,
  isNullOrEmpty,
  serializeObjectToJson,
  CommonDefinition,
  JsonProperty
} from '@app/utilities';

export class McsQueryParam {
  @JsonProperty({ name: 'page' })
  public pageIndex?: number;

  @JsonProperty({ name: 'per_page' })
  public pageSize?: number;

  @JsonProperty({ name: 'keyword' })
  public keyword?: string = '';

  // public set keyword(value: string) {
  //   this._keyword = value;
  // }
  // public get keyword(): string {
  //   return isNullOrEmpty(this._keyword) ? '' : this._keyword;
  // }
  // private _keyword?: string;

  constructor() {
    this.keyword = '';
    this.pageIndex = CommonDefinition.PAGE_INDEX_DEFAULT;
    this.pageSize = CommonDefinition.PAGE_SIZE_MAX;
  }

  public static convertCustomQueryToParamMap<TQuery>(query: TQuery): Map<string, string> {
    let serializedJson = serializeObjectToJson(query);
    if (isNullOrEmpty(serializedJson)) { return null; }
    return convertJsonToMapObject(serializedJson as any);
  }
}
