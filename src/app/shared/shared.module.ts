import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
/** Modules */
import { PopoverModule } from './popover/popover.module';
import { ModalModule } from './modal/modal.module';
import { IconModule } from './icon/icon.module';
import { ValidationMessageModule } from './validation-message/validation-message.module';
import { TableModule } from './table/table.module';
import { ListPanelModule } from './list-panel/list-panel.module';
import { PageHeaderModule } from './page-header/page-header.module';
/** Components */
import { ButtonComponent } from './button/button.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { RadioButtonGroupComponent } from './radio-button-group/radio-button-group.component';
import { FilterSelectorComponent } from './filter-selector/filter-selector.component';
import { TextboxComponent } from './textbox/textbox.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { SliderComponent } from './slider/slider.component';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { AlertComponent } from './alert/alert.component';
import { WizardComponent } from './wizard/wizard.component';
import { WizardStepComponent } from './wizard/wizard-step/wizard-step.component';
import { PaginatorComponent } from './paginator/paginator.component';
import { SearchComponent } from './search/search.component';
/** Directives */
import { HasPermissionDirective } from './authentication/has-permission.directive';

@NgModule({
  declarations: [
    ButtonComponent,
    CheckboxComponent,
    RadioButtonGroupComponent,
    FilterSelectorComponent,
    TextboxComponent,
    DropdownComponent,
    SliderComponent,
    ProgressBarComponent,
    AlertComponent,
    WizardStepComponent,
    WizardComponent,
    PaginatorComponent,
    HasPermissionDirective,
    SearchComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    PopoverModule,
    ModalModule,
    IconModule,
    ValidationMessageModule,
    TableModule,
    ListPanelModule,
    PageHeaderModule
  ],
  exports: [
    ButtonComponent,
    CheckboxComponent,
    RadioButtonGroupComponent,
    FilterSelectorComponent,
    TextboxComponent,
    DropdownComponent,
    SliderComponent,
    ProgressBarComponent,
    AlertComponent,
    WizardStepComponent,
    WizardComponent,
    PaginatorComponent,
    HasPermissionDirective,
    SearchComponent,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    PopoverModule,
    ModalModule,
    IconModule,
    ValidationMessageModule,
    TableModule,
    ListPanelModule,
    PageHeaderModule
  ]
})

export class SharedModule { }
