import { McsEntityBase } from '../../../../core';

export class ResourceStorage extends McsEntityBase {
  public name: string;
  public iops: number;
  public enabled: boolean;
  public limitMB: number;
  public usedMB: number;
  public availableMB: number;

  constructor() {
    super();
    this.name = undefined;
    this.iops = undefined;
    this.enabled = undefined;
    this.limitMB = undefined;
    this.usedMB = undefined;
    this.availableMB = undefined;
  }

  /**
   * Returns storage toggle label
   */
  public get toggleLabel(): string {
    return this.enabled ? 'Enabled' : 'Disabled';
  }
}
