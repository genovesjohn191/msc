import { CommonDefinition } from '@app/utilities';

export class McsQueryParam {
  public keyword?: string;
  public pageIndex?: number;
  public pageSize?: number;

  constructor() {
    this.keyword = '';
    this.pageIndex = CommonDefinition.PAGE_INDEX_DEFAULT;
    this.pageSize = CommonDefinition.PAGE_SIZE_MAX;
  }
}
