import {
  NgModule,
  Type
} from '@angular/core';
import { McsApiService } from '@app/services';
import { SharedModule } from '@app/shared';

import { CheckBoxListComponent } from './checkbox-list/checkbox-list.component';
import { FieldErrorMessageDirective } from './field-directives/field-error-message.directive';
import { FieldInputNoteComponent } from './field-input-note/field-input-note.component';
import { FieldInputUrlComponent } from './field-input-url/field-input-url.component';
import { FieldInputComponent } from './field-input/field-input.component';
import { FieldSelectContactComponent } from './field-select-contact/field-select-contact.component';
import { FieldSelectDnsZoneTypeComponent } from './field-select-dns-zone-type/field-select-dns-zone-type.component';
import { FieldSelectTreeViewComponent } from './field-select-tree-view/field-select-tree-view.component';
import { InputInlineEditComponent } from './input-inline-edit/input-inline-edit.component';
import { OrderListBoxComponent } from './order-listbox/order-listbox.component';
import { SelectColocationDeviceComponent } from './select-colocation-service/select-colocation-service.component';
import { SelectManagementTagComponent } from './select-management-tag/select-management-tag.component';
import { SelectResourceDropdownComponent } from './select-resource/select-resource-dropdown.component';
import { SelectStorageProfileComponent } from './select-storage-profile/select-storage-profile.component';

const exports: any[] | Type<any> = [
  // TODO(apascual): Need to adjust these 3 fields since they need to
  // extends on FormFieldBaseComponent2
  SelectResourceDropdownComponent,
  SelectStorageProfileComponent,
  InputInlineEditComponent,

  FieldErrorMessageDirective,

  CheckBoxListComponent,
  FieldInputComponent,
  FieldInputNoteComponent,
  FieldInputUrlComponent,
  FieldSelectContactComponent,
  FieldSelectDnsZoneTypeComponent,
  FieldSelectTreeViewComponent,
  OrderListBoxComponent,
  SelectColocationDeviceComponent,
  SelectManagementTagComponent
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
