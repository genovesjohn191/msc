import { CommonDefinition } from '@app/utilities';

export class McsQueryParam {
  public keyword?: string;
  public pageIndex?: number;
  public pageSize?: number;

  constructor() {
    this.keyword = '';
    this.pageIndex = CommonDefinition.DEFAULT_PAGE_INDEX;
    this.pageSize = CommonDefinition.DEFAULT_PAGE_SIZE;
  }
}
