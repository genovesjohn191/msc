import {
  McsServer,
  McsPermission,
  McsFeatureFlag,
  ServiceType,
  PlatformType
} from '@app/models';

export class McsServerPermission {
  constructor(private _server: McsServer) {
  }

  /**
   * Returns the permission for Vm Access based on Server Type
   */
  public get vmAccess(): string[] {
    if (this._server.platform.type === PlatformType.VCenter) {
      return [McsPermission.DedicatedVmAccess];
    } else if (this._server.serviceType === ServiceType.Managed) {
      return [McsPermission.ManagedCloudVmAccess];
    } else {
      return [McsPermission.SelfManagedCloudVmAccess];
    }
  }

  /**
   * Returns the permission for Vm Edit based on Server Type
   */
  public get vmEdit(): string[] {
    if (this._server.platform.type === PlatformType.VCenter) {
      return [McsPermission.DedicatedVmEdit];
    } else if (this._server.serviceType === ServiceType.Managed) {
      return [McsPermission.ManagedCloudVmEdit];
    } else {
      return [McsPermission.SelfManagedCloudVmEdit];
    }
  }

  /**
   * Returns the permission for Vm Nic Edit based on Server Type
   */
  public get vmNicEdit(): string[] {
    if (this._server.platform.type === PlatformType.VCenter) {
      return [McsPermission.DedicatedVmNicEdit];
    } else if (this._server.serviceType === ServiceType.Managed) {
      return [McsPermission.ManagedCloudVmNicEdit];
    } else {
      return [McsPermission.SelfManagedCloudVmNicEdit];
    }
  }

  /**
   * Returns the permission for Vm Snapshot Access based on Server Type
   */
  public get vmSnapshotAccess(): string[] {
    if (this._server.platform.type === PlatformType.VCenter) {
      return [McsPermission.DedicatedVmSnapshotAccess];
    } else if (this._server.serviceType === ServiceType.Managed) {
      return [McsPermission.ManagedCloudVmSnapshotAccess];
    } else {
      return [McsPermission.SelfManagedCloudVmSnapshotAccess];
    }
  }

  /**
   * Returns the permission for Vm Power State Edit based on Server Type
   */
  public get vmPowerStateEdit(): string[] {
    if (this._server.platform.type === PlatformType.VCenter) {
      return [McsPermission.DedicatedVmPowerStateEdit];
    } else if (this._server.serviceType === ServiceType.Managed) {
      return [McsPermission.ManagedCloudVmPowerStateEdit];
    } else {
      return [McsPermission.SelfManagedCloudVmPowerStateEdit];
    }
  }

  /**
   * Returns the permission for Vm Patch Management
   */
  public get vmPatchManagement(): string[] {
    if (this._server.platform.type === PlatformType.VCenter) {
      return [McsPermission.DedicatedVmPatchManagement];
    } else if (this._server.serviceType === ServiceType.Managed) {
      return [McsPermission.ManagedCloudVmPatchManagement];
    }
  }

  /**
   * Returns the permission for Scaling
   */
  public get vmScale(): string[] {
    return this._server.isSelfManaged ? this.vmNicEdit : [McsPermission.OrderEdit];
  }
}
