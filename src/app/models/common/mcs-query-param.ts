import { CommonDefinition, isNullOrEmpty } from '@app/utilities';

export class McsQueryParam {
  public set keyword(value: string) {
    this._keyword = value;
  }

  public get keyword(): string {
    return isNullOrEmpty(this._keyword) ? '' : this._keyword;
  }

  public pageIndex?: number;
  public pageSize?: number;

  private _keyword?: string;

  constructor() {
    this.keyword = '';
    this.pageIndex = CommonDefinition.PAGE_INDEX_DEFAULT;
    this.pageSize = CommonDefinition.PAGE_SIZE_MAX;
  }
}
