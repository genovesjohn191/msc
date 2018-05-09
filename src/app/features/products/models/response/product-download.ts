export class ProductDownload {
  public id: any;
  public name: string;
  public fileType: string;
  public fileSizeInKB: number;
  public url: string;

  constructor() {
    this.id = undefined;
    this.name = undefined;
    this.fileType = undefined;
    this.fileSizeInKB = undefined;
    this.url = undefined;
  }
}
