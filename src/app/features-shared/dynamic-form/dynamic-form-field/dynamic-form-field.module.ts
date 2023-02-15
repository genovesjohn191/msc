import {
  NgModule,
  Type
} from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';

import { DynamicInputHiddenComponent } from './input-hidden/input-hidden.component';
import { DynamicInputIpComponent } from './input-ip/input-ip.component';
import { DynamicInputNetworkDbNetworkNameComponent } from './input-network-db-network-name/input-network-db-network-name.component';
import { DynamicInputNumberComponent } from './input-number/input-number.component';
import { DynamicInputPasswordComponent } from './input-password/input-password.component';
import { DynamicInputServerPanelComponent } from './input-server-panel/input-server-panel.component';
import { DynamicInputRandomComponent } from './input-random/input-random.component';
import { DynamicInputShortCustomerNameComponent } from './input-short-customer-name/input-short-customer-name.component';
import { DynamicInputTerraformDeploymentNameComponent } from './input-terraform-deployment-name/input-terraform-deployment-name.component';
import { DynamicInputTextComponent } from './input-text/input-text.component';
import { DynamicInputVcloudAllocationComponent } from './input-vcloud-allocation/input-vcloud-allocation.component';
import { DynamicSelectAvailabilityZoneComponent } from './select-availability-zone/select-availability-zone.component';
import { DynamicSelectChipsAzureSoftwareSubscriptionProductTypeComponent } from './select-chips-azure-software-subscription-product-type/select-chips-azure-software-subscription-product-type.component';
import { DynamicSelectAzureSubscriptionComponent } from './select-azure-subscription/select-azure-subscription.component';
import { DynamicSelectBatComponent } from './select-bat/select-bat.component';
import { DynamicSelectChipSingleCompanyComponent } from './select-chip-single-company/select-chip-single-company.component';
import { DynamicSelectChipsCompanyComponent } from './select-chips-company/select-chips-company.component';
import { DynamicSelectChipsManagementDomainComponent } from './select-chips-management-domain/select-chips-management-domain.component';
import { DynamicSelectChipsTerraformModuleComponent } from './select-chips-terraform-module/select-chips-terraform-module.component';
import { DynamicSelectChipsTerraformTagComponent } from './select-chips-terraform-tag/select-chips-terraform-tag.component';
import { DynamicSelectChipsVmComponent } from './select-chips-vm/select-chips-vm.component';
import { DynamicSelectChipsComponent } from './select-chips/select-chips.component';
import { DynamicSelectGroupComponent } from './select-group/select-group.component';
import { DynamicSelectMultipleComponent } from './select-multiple/select-multiple.component';
import { DynamicSelectNetworkDbPodComponent } from './select-network-db-pod/select-network-db-pod.component';
import { DynamicSelectMultipleNetworkDbPodsComponent } from './select-multiple-network-db-pods/select-multiple-network-db-pods.component';
import { DynamicSelectNetworkDbUseCaseComponent } from './select-network-db-usecase/select-network-db-use-case.component';
import { DynamicSelectNetworkComponent } from './select-network/select-network.component';
import { DynamicSelectGatewayIpComponent } from './select-gateway-ip/select-gateway-ip.component';
import { DynamicSelectNetworkVlanComponent } from './select-network-vlan/select-network-vlan.component';
import { DynamicSelectOsComponent } from './select-os/select-os.component';
import { DynamicSelectRetentionPeriodComponent } from './select-retention-period/select-retention-period.component';
import { DynamicSelectChipsServiceComponent } from './select-chips-service/select-chips-service.component';
import { DynamicSelectServiceComponent} from './select-service/select-service.component';
import { DynamicSelectStorageProfileComponent } from './select-storage-profile/select-storage-profile.component';
import { DynamicSelectTenantComponent } from './select-tenant/select-tenant.component';
import { DynamicSelectTerraformModuleTypeComponent } from './select-terraform-module-type/select-terraform-module-type.component';
import { DynamicSelectPodsComponent } from './select-pods/select-pods.component';
import { DynamicSelectVdcComponent } from './select-vdc/select-vdc.component';
import { DynamicSelectVmComponent } from './select-vm/select-vm.component';
import { DynamicSelectComponent } from './select/select.component';
import { DynamicSlideToggleComponent } from './slide-toggle/slide-toggle.component';
import {
  DynamicSelectSoftwareSubscriptionProductTypeComponent
} from './select-software-suscription-product-type/select-software-suscription-product-type.component';
import { DynamicSelectReservationProductTypeComponent } from './select-reservation-product-type/select-reservation-product-type.component';
import { DynamicInputSizeComponent } from './input-size/input-size.component';
import { DynamicInputSubscriptionIdComponent } from './input-subscription-id/input-subscription-id.component';
import { DynamicSelectVmSizeComponent } from './select-vm-size/select-vm-size.component';
import { DynamicSelectLocationComponent } from './select-location/select-location.component';
import { DynamicSelectResourceGroupComponent } from './select-resource-group/select-resource-group.component';
import { DynamicSelectAzureResourceComponent } from './select-azure-resource/select-azure-resource.component';
import { DynamicSelectFortiManagerComponent } from './select-forti-manager/select-forti-manager.component';
import { DynamicSelectFortiAnalyzerComponent } from './select-forti-analyzer/select-forti-analyzer.component';
import { DynamicSelectResourceComponent } from './select-resource/select-resource.component';
import { DynamicSelectNetworkInterfaceComponent } from './select-network-interface/select-network-interface.component';
import { DynamicSelectPhysicalServerComponent } from './select-physical-server/select-physical-server.component';
import { DynamicSelectLunsComponent } from './select-luns/select-luns.component';
import { DynamicInputComputeComponent } from './input-compute/input-compute.component';
import { DynamicSelectUcsComponent } from './select-ucs/select-ucs.component';
import { DynamicSelectVcloudInstanceComponent } from './select-vcloud-instance/select-vcloud-instance.component';
import { DynamicSelectVcloudTypeComponent } from './select-vcloud-type/select-vcloud-type.component';
import { DynamicSelectProviderVdcComponent } from './select-provider-vdc/select-provider-vdc.component';
import { DynamicTableStorageProfileComponent } from './table-storage-profile/table-storage-profile.component';
import { DynamicExpansionSlideToggleComponent } from './expansion-slide-toggle/expansion-slide-toggle.component';
import { DynamicSelectVdcStorageComponent } from './select-vdc-storage/select-vdc-storage.component';
import { DynamicInputStorageSizeComponent } from './input-storage-size/input-storage-size.component';
import { DynamicStorageSlideToggleComponent } from './storage-slide-toggle/storage-slide-toggle.component';
import { DynamicSelectStorageTierComponent } from './select-storage-tier/select-storage-tier.component';
import { FormFieldsModule } from '@app/features-shared/form-fields/form-fields.module';

const exports: any[] | Type<any> = [
  DynamicInputNumberComponent,
  DynamicInputHiddenComponent,
  DynamicInputIpComponent,
  DynamicInputNetworkDbNetworkNameComponent,
  DynamicInputTextComponent,
  DynamicInputPasswordComponent,
  DynamicInputTerraformDeploymentNameComponent,
  DynamicInputServerPanelComponent,
  DynamicInputRandomComponent,
  DynamicInputShortCustomerNameComponent,
  DynamicInputSizeComponent,
  DynamicInputSubscriptionIdComponent,
  DynamicInputStorageSizeComponent,
  DynamicInputVcloudAllocationComponent,
  DynamicSelectAzureSubscriptionComponent,
  DynamicSelectAvailabilityZoneComponent,
  DynamicSelectBatComponent,
  DynamicSelectChipSingleCompanyComponent,
  DynamicSelectChipsComponent,
  DynamicSelectChipsManagementDomainComponent,
  DynamicSelectChipsAzureSoftwareSubscriptionProductTypeComponent,
  DynamicSelectChipsCompanyComponent,
  DynamicSelectChipsTerraformModuleComponent,
  DynamicSelectChipsTerraformTagComponent,
  DynamicSelectChipsVmComponent,
  DynamicSelectFortiManagerComponent,
  DynamicSelectFortiAnalyzerComponent,
  DynamicSelectComponent,
  DynamicSelectAzureResourceComponent,
  DynamicSelectGroupComponent,
  DynamicSelectLocationComponent,
  DynamicSelectMultipleComponent,
  DynamicSelectMultipleNetworkDbPodsComponent,
  DynamicSelectNetworkDbPodComponent,
  DynamicSelectNetworkComponent,
  DynamicSelectGatewayIpComponent,
  DynamicSelectNetworkVlanComponent,
  DynamicSelectNetworkDbUseCaseComponent,
  DynamicSelectOsComponent,
  DynamicSelectProviderVdcComponent,
  DynamicSelectRetentionPeriodComponent,
  DynamicSelectChipsServiceComponent,
  DynamicSelectServiceComponent,
  DynamicSelectSoftwareSubscriptionProductTypeComponent,
  DynamicSelectReservationProductTypeComponent,
  DynamicSelectResourceGroupComponent,
  DynamicSelectStorageTierComponent,
  DynamicSelectStorageProfileComponent,
  DynamicSelectTenantComponent,
  DynamicSelectTerraformModuleTypeComponent,
  DynamicSelectPodsComponent,
  DynamicSelectVdcComponent,
  DynamicSelectVdcStorageComponent,
  DynamicSelectVmComponent,
  DynamicSelectVmSizeComponent,
  DynamicSlideToggleComponent,
  DynamicSelectResourceComponent,
  DynamicSelectNetworkInterfaceComponent,
  DynamicSelectPhysicalServerComponent,
  DynamicSelectVcloudTypeComponent,
  DynamicSelectVcloudInstanceComponent,
  DynamicSelectLunsComponent,
  DynamicInputComputeComponent,
  DynamicSelectUcsComponent,
  DynamicTableStorageProfileComponent,
  DynamicExpansionSlideToggleComponent,
  DynamicStorageSlideToggleComponent
];

@NgModule({
  imports: [
    SharedModule,
    FormFieldsModule,
  ],
  declarations: [...exports],
  exports: [...exports]
})
export class DynamicFormFieldModule { }
