import {
  MatFormFieldModule,
  MatSelectModule,
  MatOptionModule,
  MatInputModule,
  MatBadgeModule,
  MatTooltipModule,
  MatProgressSpinnerModule,
  MatButtonToggleModule,
  MatIconModule,
  MatButtonModule
} from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared/shared.module';

import { DynamicInputTextComponent } from './input-text/input-text.component';
import { DynamicSelectComponent } from './select/select.component';
import { DynamicSelectOsComponent } from './select-os/select-os.component';
import { DynamicSelectVdcComponent } from './select-vdc/select-vdc.component';
import { DynamicSelectMultipleComponent } from './select-multiple/select-multiple.component';
import { DynamicInputNumberComponent } from './input-number/input-number.component';
import { DynamicInputRandomComponent } from './input-random/input-random.component';
import { DynamicSelectGroupComponent } from './select-group/select-group.component';
import { DynamicSelectStorageProfileComponent } from './select-storage-profile/select-storage-profile.component';
import { DynamicSelectNetworkComponent } from './select-network/select-network.component';

@NgModule({
  imports: [
    SharedModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatBadgeModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatInputModule,
    MatOptionModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule
  ],
  declarations: [
    DynamicInputNumberComponent,
    DynamicInputTextComponent,
    DynamicInputRandomComponent,
    DynamicSelectComponent,
    DynamicSelectGroupComponent,
    DynamicSelectMultipleComponent,
    DynamicSelectNetworkComponent,
    DynamicSelectOsComponent,
    DynamicSelectStorageProfileComponent,
    DynamicSelectVdcComponent
  ],
  exports: [
    DynamicInputNumberComponent,
    DynamicInputTextComponent,
    DynamicInputRandomComponent,
    DynamicSelectComponent,
    DynamicSelectGroupComponent,
    DynamicSelectMultipleComponent,
    DynamicSelectNetworkComponent,
    DynamicSelectOsComponent,
    DynamicSelectStorageProfileComponent,
    DynamicSelectVdcComponent
  ]
})
export class DynamicFormFieldModule { }
