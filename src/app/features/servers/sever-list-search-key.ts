export class ServerListSearchKey {
  public page: number;
  public maxItemPerPage: number;
  public serverNameKeyword: string;

  public isEqual(newSearchKey: ServerListSearchKey): boolean {
    return this.page === newSearchKey.page &&
      this.maxItemPerPage === newSearchKey.maxItemPerPage &&
      this.serverNameKeyword.localeCompare(newSearchKey.serverNameKeyword) === 0;
  }
}
