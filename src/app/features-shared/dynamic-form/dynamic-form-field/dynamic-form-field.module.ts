import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from '@app/shared/shared.module';

import { DynamicInputHiddenComponent } from './input-hidden/input-hidden.component';
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

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    DynamicInputNumberComponent,
    DynamicInputHiddenComponent,
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
    DynamicInputHiddenComponent,
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
