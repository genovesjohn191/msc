import {
  NgModule,
  Type
} from '@angular/core';
import { McsApiService } from '@app/services';
import { SharedModule } from '@app/shared';

import { SelectResourceDropdownComponent } from './select-resource/select-resource-dropdown.component';
import { SelectStorageProfileComponent } from './select-storage-profile/select-storage-profile.component';

const exports: any[] | Type<any> = [
  SelectResourceDropdownComponent,
  SelectStorageProfileComponent
];

@NgModule({
  imports: [ SharedModule ],
  declarations: [...exports],
  exports: [...exports],
  providers: [
    SharedModule,
    McsApiService
  ]
})
export class FormFieldsModule { }
