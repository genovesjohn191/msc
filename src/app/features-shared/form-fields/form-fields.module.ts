import {
  NgModule,
  Type
} from '@angular/core';
import { McsApiService } from '@app/services';
import { SharedModule } from '@app/shared';

import { FieldErrorMessageDirective } from './field-directives/field-error-message.directive';
import { FieldInputNoteComponent } from './field-input-note/field-input-note.component';
import { FieldSelectContactComponent } from './field-select-contact/field-select-contact.component';
import { InputInlineEditComponent } from './input-inline-edit/input-inline-edit.component';
import { SelectResourceDropdownComponent } from './select-resource/select-resource-dropdown.component';
import { SelectStorageProfileComponent } from './select-storage-profile/select-storage-profile.component';
import { CheckBoxListComponent } from './checkbox-list/checkbox-list.component';
import { SelectManagementTagComponent } from './select-management-tag/select-management-tag.component';

const exports: any[] | Type<any> = [
  // TODO(apascual): Need to adjust these 3 fields since they need to
  // extends on FormFieldBaseComponent2
  SelectResourceDropdownComponent,
  SelectStorageProfileComponent,
  InputInlineEditComponent,

  FieldErrorMessageDirective,

  CheckBoxListComponent,
  FieldSelectContactComponent,
  FieldInputNoteComponent,
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
