import {
  NgModule,
  Type
} from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';

import { DynamicInputHiddenComponent } from './input-hidden/input-hidden.component';
import { DynamicInputIpComponent } from './input-ip/input-ip.component';
import { DynamicInputNumberComponent } from './input-number/input-number.component';
import { DynamicInputRandomComponent } from './input-random/input-random.component';
import { DynamicInputTextComponent } from './input-text/input-text.component';
import { DynamicSelectGroupComponent } from './select-group/select-group.component';
import { DynamicSelectMultipleComponent } from './select-multiple/select-multiple.component';
import { DynamicSelectNetworkComponent } from './select-network/select-network.component';
import { DynamicSelectOsComponent } from './select-os/select-os.component';
import { DynamicSelectStorageProfileComponent } from './select-storage-profile/select-storage-profile.component';
import { DynamicSelectVdcComponent } from './select-vdc/select-vdc.component';
import { DynamicSelectComponent } from './select/select.component';

const exports: any[] | Type<any> = [
  DynamicInputNumberComponent,
  DynamicInputHiddenComponent,
  DynamicInputIpComponent,
  DynamicInputTextComponent,
  DynamicInputRandomComponent,
  DynamicSelectComponent,
  DynamicSelectGroupComponent,
  DynamicSelectMultipleComponent,
  DynamicSelectNetworkComponent,
  DynamicSelectOsComponent,
  DynamicSelectStorageProfileComponent,
  DynamicSelectVdcComponent
];

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [...exports],
  exports: [...exports]
})
export class DynamicFormFieldModule { }
