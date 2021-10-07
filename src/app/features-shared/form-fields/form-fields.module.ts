import {
  NgModule,
  Type
} from '@angular/core';
import { McsApiService } from '@app/services';
import { SharedModule } from '@app/shared';

import { CheckBoxListComponent } from './checkbox-list/checkbox-list.component';
import { FieldErrorMessageDirective } from './field-directives/field-error-message.directive';
import { FieldInputDatePickerComponent } from './field-input-date-picker/field-input-date-picker.component';
import { FieldInputNoteComponent } from './field-input-note/field-input-note.component';
import { FieldInputNumberArrowComponent } from './field-input-number-arrow/field-input-number-arrow.component';
import { FieldInputTimePickerComponent } from './field-input-time-picker.component/field-input-time-picker.component';
import { FieldInputUrlComponent } from './field-input-url/field-input-url.component';
import { FieldInputComponent } from './field-input/field-input.component';
import { FieldSelectBillingAccountComponent } from './field-select-billing-account/field-select-billing-account.component';
import { FieldSelectBillingServiceComponent } from './field-select-billing-service/field-select-billing-service.component';
import { FieldSelectContactComponent } from './field-select-contact/field-select-contact.component';
import { FieldSelectDnsZoneTypeComponent } from './field-select-dns-zone-type/field-select-dns-zone-type.component';
import { FieldSelectMonthPeriodComponent } from './field-select-month-period/field-select-month-period.component';
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
  FieldInputDatePickerComponent,
  FieldInputNoteComponent,
  FieldInputNumberArrowComponent,
  FieldInputTimePickerComponent,
  FieldInputUrlComponent,
  FieldSelectContactComponent,
  FieldSelectDnsZoneTypeComponent,
  FieldSelectTreeViewComponent,
  FieldSelectBillingAccountComponent,
  FieldSelectBillingServiceComponent,
  FieldSelectMonthPeriodComponent,
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
