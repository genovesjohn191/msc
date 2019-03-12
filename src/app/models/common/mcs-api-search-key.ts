export class McsApiSearchKey {
  public page: number;
  public maxItemPerPage: number;
  public keyword: string;

  public isEqual(newSearchKey: McsApiSearchKey): boolean {
    return this.page === newSearchKey.page &&
      this.maxItemPerPage === newSearchKey.maxItemPerPage &&
      this.keyword.localeCompare(newSearchKey.keyword) === 0;
  }
}
