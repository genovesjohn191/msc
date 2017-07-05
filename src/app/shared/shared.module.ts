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
import { ModalComponent } from './modal/modal.component';
import { ModalBackdropComponent } from './modal/modal-backdrop/modal-backdrop.component';

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
    AlertComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    PopoverModule,
    ModalModule,
    IconModule
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
    CommonModule,
    RouterModule,
    FormsModule,
    PopoverModule,
    ModalModule,
    IconModule
  ]
})

export class SharedModule { }
