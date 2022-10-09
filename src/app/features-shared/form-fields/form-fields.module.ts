import {
  NgModule,
  Type
} from '@angular/core';
import { McsApiService } from '@app/services';
import { SharedModule } from '@app/shared';

import { CheckBoxListComponent } from './checkbox-list/checkbox-list.component';
import { FieldAutocompleteScrollDirective } from './field-autocomplete/field-autocomplete-scroll.directive';
import { FieldAutocompleteComponent } from './field-autocomplete/field-autocomplete.component';
import { FieldAutocompletePipe } from './field-autocomplete/field-autocomplete.pipe';
import { FieldAutocompleteService } from './field-autocomplete/field-autocomplete.service';
import { MCS_FIELD_AUTOCOMPLETE_TOKEN } from './field-autocomplete/services/field-autocomplete.service';
import { FieldErrorMessageDirective } from './field-directives/field-error-message.directive';
import { FieldInputDatePickerComponent } from './field-input-date-picker/field-input-date-picker.component';
import { FieldInputListComponent } from './field-input-list/field-input-list.component';
import { FieldInputNoteComponent } from './field-input-note/field-input-note.component';
import { FieldInputNumberArrowComponent } from './field-input-number-arrow/field-input-number-arrow.component';
import { FieldInputTextareaComponent } from './field-input-textarea/field-input-textarea.component';
import { FieldInputTimePickerComponent } from './field-input-time-picker.component/field-input-time-picker.component';
import { FieldInputUrlComponent } from './field-input-url/field-input-url.component';
import { FieldInputComponent } from './field-input/field-input.component';
import { FieldSelectBillingAccountComponent } from './field-select-billing-account/field-select-billing-account.component';
import { FieldSelectBillingServiceComponent } from './field-select-billing-service/field-select-billing-service.component';
import { FieldSelectContactComponent } from './field-select-contact/field-select-contact.component';
import { FieldSelectDnsZoneTypeComponent } from './field-select-dns-zone-type/field-select-dns-zone-type.component';
import { FieldSelectMonitoringPeriodComponent } from './field-select-monitoring-period/field-select-monitoring-period.component';
import { FieldSelectMonthPeriodComponent } from './field-select-month-period/field-select-month-period.component';
import { FieldSelectTreeViewComponent } from './field-select-tree-view/field-select-tree-view.component';
import { FieldSelectComponent } from './field-select/field-select.component';
import { FieldSelectPipe } from './field-select/field-select.pipe';
import { FieldSelectService } from './field-select/field-select.service';
import { MCS_FIELD_SELECT_TOKEN } from './field-select/services/field-select.service';
import { InputInlineEditComponent } from './input-inline-edit/input-inline-edit.component';
import { OrderListBoxComponent } from './order-listbox/order-listbox.component';
import { SelectColocationDeviceComponent } from './select-colocation-service/select-colocation-service.component';
import { FieldSelectListComponent } from './field-select-list/field-select-list.component';
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
  FieldInputTextareaComponent,
  FieldInputListComponent,

  FieldSelectComponent,
  FieldSelectPipe,
  FieldSelectContactComponent,
  FieldSelectDnsZoneTypeComponent,
  FieldSelectTreeViewComponent,
  FieldSelectMonitoringPeriodComponent,
  FieldSelectBillingAccountComponent,
  FieldSelectBillingServiceComponent,
  FieldSelectMonthPeriodComponent,
  FieldSelectListComponent,

  FieldAutocompleteComponent,
  FieldAutocompletePipe,
  FieldAutocompleteScrollDirective,

  OrderListBoxComponent,
  SelectColocationDeviceComponent
];

@NgModule({
  imports: [SharedModule],
  declarations: [...exports],
  exports: [...exports],
  providers: [
    SharedModule,
    McsApiService,

    // Token based settings
    { provide: MCS_FIELD_SELECT_TOKEN, useClass: FieldSelectService },
    { provide: MCS_FIELD_AUTOCOMPLETE_TOKEN, useClass: FieldAutocompleteService }
  ]
})
export class FormFieldsModule { }
