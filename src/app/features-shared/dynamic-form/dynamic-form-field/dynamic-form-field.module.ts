import {
  NgModule,
  Type
} from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';

import { DynamicInputHiddenComponent } from './input-hidden/input-hidden.component';
import { DynamicInputIpComponent } from './input-ip/input-ip.component';
import { DynamicInputNumberComponent } from './input-number/input-number.component';
import { DynamicInputPasswordComponent } from './input-password/input-password.component';
import { DynamicInputRandomComponent } from './input-random/input-random.component';
import { DynamicInputTextComponent } from './input-text/input-text.component';
import { DynamicSelectAvailabilityZoneComponent } from './select-availability-zone/select-availability-zone.component';
import { DynamicSelectBatComponent } from './select-bat/select-bat.component';
import { DynamicSelectChipsCompanyComponent } from './select-chips-company/select-chips-company.component';
import { DynamicSelectChipsTenantComponent } from './select-chips-tenant/select-chips-tenant.component';
import { DynamicSelectChipsVmComponent } from './select-chips-vm/select-chips-vm.component';
import { DynamicSelectChipsComponent } from './select-chips/select-chips.component';
import { DynamicSelectGroupComponent } from './select-group/select-group.component';
import { DynamicSelectMultipleComponent } from './select-multiple/select-multiple.component';
import { DynamicSelectNetworkComponent } from './select-network/select-network.component';
import { DynamicSelectOsComponent } from './select-os/select-os.component';
import { DynamicSelectRetentionPeriodComponent } from './select-retention-period/select-retention-period.component';
import { DynamicSelectStorageProfileComponent } from './select-storage-profile/select-storage-profile.component';
import { DynamicSelectVdcComponent } from './select-vdc/select-vdc.component';
import { DynamicSelectVmComponent } from './select-vm/select-vm.component';
import { DynamicSelectComponent } from './select/select.component';
import { DynamicSlideToggleComponent } from './slide-toggle/slide-toggle.component';

const exports: any[] | Type<any> = [
  DynamicInputNumberComponent,
  DynamicInputHiddenComponent,
  DynamicInputIpComponent,
  DynamicInputTextComponent,
  DynamicInputPasswordComponent,
  DynamicInputRandomComponent,
  DynamicSelectAvailabilityZoneComponent,
  DynamicSelectBatComponent,
  DynamicSelectChipsComponent,
  DynamicSelectChipsCompanyComponent,
  DynamicSelectChipsTenantComponent,
  DynamicSelectChipsVmComponent,
  DynamicSelectComponent,
  DynamicSelectGroupComponent,
  DynamicSelectMultipleComponent,
  DynamicSelectNetworkComponent,
  DynamicSelectOsComponent,
  DynamicSelectRetentionPeriodComponent,
  DynamicSelectStorageProfileComponent,
  DynamicSelectVdcComponent,
  DynamicSelectVmComponent,
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
