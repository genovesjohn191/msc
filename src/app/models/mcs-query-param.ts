import { CoreDefinition } from '@app/core';

export class McsQueryParam {
  public keyword: string;
  public pageIndex: number;
  public pageSize: number;

  constructor() {
    this.keyword = '';
    this.pageIndex = CoreDefinition.DEFAULT_PAGE_INDEX;
    this.pageSize = CoreDefinition.DEFAULT_PAGE_SIZE;
  }
}
