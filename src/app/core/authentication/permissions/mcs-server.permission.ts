import {
  McsServer,
  McsPermission
} from '@app/models';

export class McsServerPermission {
  constructor(private _server: McsServer) {
  }

  /**
   * Returns the permission for Vm Access based on Server Type
   */
  public get VmAccess(): string[] {
    return this._server.isDedicated ?
      [McsPermission.DedicatedVmAccess] : [McsPermission.CloudVmAccess];
  }

  /**
   * Returns the permission for Vm Edit based on Server Type
   */
  public get VmEdit(): string[] {
    return this._server.isDedicated ?
      [McsPermission.DedicatedVmEdit] : [McsPermission.CloudVmEdit];
  }

  /**
   * Returns the permission for Vm Nic Edit based on Server Type
   */
  public get VmNicEdit(): string[] {
    return this._server.isDedicated ?
      [McsPermission.DedicatedVmNicEdit] : [McsPermission.CloudVmNicEdit];
  }

  /**
   * Returns the permission for Vm Power State Edit based on Server Type
   */
  public get VmPowerStateEdit(): string[] {
    return this._server.isDedicated ?
      [McsPermission.DedicatedVmPowerStateEdit] : [McsPermission.CloudVmPowerStateEdit];
  }

  /**
   * Returns the permission for Vm Patch Management
   */
  public get VmPatchManagement(): string[] {
    return [McsPermission.CloudVmPatchManagement];
  }
}
