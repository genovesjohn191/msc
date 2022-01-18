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
import { DynamicInputRandomComponent } from './input-random/input-random.component';
import { DynamicInputShortCustomerNameComponent } from './input-short-customer-name/input-short-customer-name.component';
import { DynamicInputTerraformDeploymentNameComponent } from './input-terraform-deployment-name/input-terraform-deployment-name.component';
import { DynamicInputTextComponent } from './input-text/input-text.component';
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
import { DynamicSelectMultipleNetworkDbPodsComponent } from './select-multiple-network-db-pods/select-multiple-network-db-pods.component';
import { DynamicSelectNetworkDbUseCaseComponent } from './select-network-db-usecase/select-network-db-use-case.component';
import { DynamicSelectNetworkComponent } from './select-network/select-network.component';
import { DynamicSelectGatewayIpComponent } from './select-gateway-ip/select-gateway-ip.component';
import { DynamicSelectNetworkVlanComponent } from './select-network-vlan/select-network-vlan.component';
import { DynamicSelectOsComponent } from './select-os/select-os.component';
import { DynamicSelectRetentionPeriodComponent } from './select-retention-period/select-retention-period.component';
import { DynamicSelectChipsServiceComponent } from './select-chips-service/select-chips-service.component';
import { DynamicSelectStorageProfileComponent } from './select-storage-profile/select-storage-profile.component';
import { DynamicSelectTenantComponent } from './select-tenant/select-tenant.component';
import { DynamicSelectTerraformModuleTypeComponent } from './select-terraform-module-type/select-terraform-module-type.component';
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

const exports: any[] | Type<any> = [
  DynamicInputNumberComponent,
  DynamicInputHiddenComponent,
  DynamicInputIpComponent,
  DynamicInputNetworkDbNetworkNameComponent,
  DynamicInputTextComponent,
  DynamicInputPasswordComponent,
  DynamicInputTerraformDeploymentNameComponent,
  DynamicInputRandomComponent,
  DynamicInputShortCustomerNameComponent,
  DynamicInputSizeComponent,
  DynamicInputSubscriptionIdComponent,
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
  DynamicSelectComponent,
  DynamicSelectAzureResourceComponent,
  DynamicSelectGroupComponent,
  DynamicSelectLocationComponent,
  DynamicSelectMultipleComponent,
  DynamicSelectMultipleNetworkDbPodsComponent,
  DynamicSelectNetworkComponent,
  DynamicSelectGatewayIpComponent,
  DynamicSelectNetworkVlanComponent,
  DynamicSelectNetworkDbUseCaseComponent,
  DynamicSelectOsComponent,
  DynamicSelectRetentionPeriodComponent,
  DynamicSelectChipsServiceComponent,
  DynamicSelectSoftwareSubscriptionProductTypeComponent,
  DynamicSelectReservationProductTypeComponent,
  DynamicSelectResourceGroupComponent,
  DynamicSelectStorageProfileComponent,
  DynamicSelectTenantComponent,
  DynamicSelectTerraformModuleTypeComponent,
  DynamicSelectVdcComponent,
  DynamicSelectVmComponent,
  DynamicSelectVmSizeComponent,
  DynamicSlideToggleComponent
];

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [...exports],
  exports: [...exports]
})
export class DynamicFormFieldModule { }
