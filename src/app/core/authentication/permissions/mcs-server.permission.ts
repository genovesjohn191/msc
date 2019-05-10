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
  public get vmAccess(): string[] {
    return this._server.isDedicated ?
      [McsPermission.DedicatedVmAccess] : [McsPermission.CloudVmAccess];
  }

  /**
   * Returns the permission for Vm Edit based on Server Type
   */
  public get vmEdit(): string[] {
    return this._server.isDedicated ?
      [McsPermission.DedicatedVmEdit] : [McsPermission.CloudVmEdit];
  }

  /**
   * Returns the permission for Vm Nic Edit based on Server Type
   */
  public get vmNicEdit(): string[] {
    return this._server.isDedicated ?
      [McsPermission.DedicatedVmNicEdit] : [McsPermission.CloudVmNicEdit];
  }

  /**
   * Returns the permission for Vm Snapshot Access based on Server Type
   */
  public get vmSnapshotAccess(): string[] {
    return this._server.isDedicated ?
      [McsPermission.DedicatedVmSnapshotAccess] : [McsPermission.CloudVmSnapshotAccess];
  }

  /**
   * Returns the permission for Vm Power State Edit based on Server Type
   */
  public get vmPowerStateEdit(): string[] {
    return this._server.isDedicated ?
      [McsPermission.DedicatedVmPowerStateEdit] : [McsPermission.CloudVmPowerStateEdit];
  }

  /**
   * Returns the permission for Vm Patch Management
   */
  public get vmPatchManagement(): string[] {
    return [McsPermission.CloudVmPatchManagement];
  }

  /**
   * Returns the permission for Scaling
   */
  public get vmScale(): string[] {
    return this._server.isSelfManaged ? this.vmNicEdit : [McsPermission.OrderEdit];
  }

  // TODO: rename this class to Access instead of Permission, to add Feature flags
  public get vmScaleFeature(): string {
    return this._server.isSelfManaged ? '' : 'EnableManagedServerScale';
  }

}
