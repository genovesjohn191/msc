import { McsEntityBase } from '../mcs-entity.base';

export class McsProductDownload extends McsEntityBase {
  public name: string;
  public fileType: string;
  public fileSizeInKB: number;
  public url: string;

  constructor() {
    super();
    this.name = undefined;
    this.fileType = undefined;
    this.fileSizeInKB = undefined;
    this.url = undefined;
  }
}
