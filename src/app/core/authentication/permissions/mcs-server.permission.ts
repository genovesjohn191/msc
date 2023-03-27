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
   * Returns the permission for server access based on server type
   */
  public get serverAccess(): string[] {
    switch(this._server.platform.type) {
     case PlatformType.VCenter: {
        return [McsPermission.DedicatedVmAccess];
        break;
     }
     case PlatformType.VCloud: {
       if (this._server.serviceType === ServiceType.Managed) {
         return [McsPermission.ManagedCloudVmAccess];
       }
       return [McsPermission.SelfManagedCloudVmAccess];
     }
     case (PlatformType.Ucs): {
        return [McsPermission.UcsBladeManagementIpView];
        break;
     }
     case (PlatformType.UcsCentral): {
        return [McsPermission.UcsBladeManagementIpView];
        break;
     }
     case (PlatformType.UcsDomain): {
        return [McsPermission.UcsBladeManagementIpView];
        break;
     }
   }
  }

  /**
   * Returns the permission for server NIC Edit based on server type
   */
  public get serverNicEdit(): string[] {
    switch(this._server.platform.type) {
     case PlatformType.VCenter: {
        return [McsPermission.DedicatedVmNicEdit];
        break;
     }
     case PlatformType.VCloud: {
       if (this._server.serviceType === ServiceType.Managed) {
         return [McsPermission.ManagedCloudVmNicEdit];
       }
       return [McsPermission.SelfManagedCloudVmNicEdit];
     }
     case (PlatformType.Ucs): {
        return [McsPermission.UcsBladeNicEdit];
        break;
     }
     case (PlatformType.UcsCentral): {
        return [McsPermission.UcsBladeNicEdit];
        break;
     }
     case (PlatformType.UcsDomain): {
        return [McsPermission.UcsBladeNicEdit];
        break;
     }
   }
  }

  /**
   * Returns the permission for VM snapshot access based on server type
   */
  public get vmSnapshotAccess(): string[] {
    switch(this._server.platform.type) {
     case PlatformType.VCenter: {
        return [McsPermission.DedicatedVmSnapshotAccess];
        break;
     }
     case PlatformType.VCloud: {
       if (this._server.serviceType === ServiceType.Managed) {
         return [McsPermission.ManagedCloudVmSnapshotAccess];
       }
       return [McsPermission.SelfManagedCloudVmSnapshotAccess];
     }
   }
  }

  /**
   * Returns the permission for server power state edit based on server type
   */
  public get serverPowerStateEdit(): string[] {
    switch(this._server.platform.type) {
      case PlatformType.VCenter: {
         return [McsPermission.DedicatedVmPowerStateEdit];
         break;
      }
      case PlatformType.VCloud: {
        if (this._server.serviceType === ServiceType.Managed) {
          return [McsPermission.ManagedCloudVmPowerStateEdit];
        }
        return [McsPermission.SelfManagedCloudVmPowerStateEdit];
      }
      case (PlatformType.Ucs): {
         return [McsPermission.UcsBladePowerStateEdit];
         break;
      }
      case (PlatformType.UcsCentral): {
         return [McsPermission.UcsBladePowerStateEdit];
         break;
      }
      case (PlatformType.UcsDomain): {
         return [McsPermission.UcsBladePowerStateEdit];
         break;
      }
    }
  }

  /**
   * Returns the permission for server patch management
   */
  public get serverPatchManagement(): string[] {
    switch(this._server.platform.type) {
     case PlatformType.VCenter: {
        return [McsPermission.DedicatedVmPatchManagement];
        break;
     }
     case PlatformType.VCloud: {
       if (this._server.serviceType === ServiceType.Managed) {
         return [McsPermission.ManagedCloudVmPatchManagement];
       }
     }
   }
  }

  /**
   * Returns the permission for VM scaling
   */
  public get vmScale(): string[] {
    switch(this._server.platform.type) {
     case PlatformType.VCloud: {
       if (this._server.serviceType === ServiceType.Managed) {
         return [McsPermission.OrderEdit];
       }
       return [McsPermission.SelfManagedCloudVmEdit];
     }
   }
  }

  /**
   * Returns the permission for viewing management IP
   */
  public get managementIP(): string[] {
    switch(this._server.platform.type) {
     case PlatformType.VCenter: {
        return [McsPermission.DedicatedVmManagementIpView];
        break;
     }
     case PlatformType.VCloud: {
       if (this._server.serviceType === ServiceType.Managed) {
         return [McsPermission.ManagedCloudVmManagementIpView];
       }
     }
     case (PlatformType.Ucs): {
        return [McsPermission.UcsBladeManagementIpView];
        break;
     }
     case (PlatformType.UcsCentral): {
        return [McsPermission.UcsBladeManagementIpView];
        break;
     }
     case (PlatformType.UcsDomain): {
        return [McsPermission.UcsBladeManagementIpView];
        break;
     }
   }
  }
}
