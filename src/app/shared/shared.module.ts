import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
/** Modules */
import { PopoverModule } from './popover/popover.module';
/** Components */
import { ButtonComponent } from './button/button.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { RadioButtonGroupComponent } from './radio-button-group/radio-button-group.component';
import { FilterSelectorComponent } from './filter-selector/filter-selector.component';
import { TextboxComponent } from './textbox/textbox.component';
import { LightboxComponent } from './lightbox/lightbox.component';
import { SvgIconComponent } from './svg-icon/svg-icon.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { SliderComponent } from './slider/slider.component';
/** Directives */
import { FlatDirective } from './directives/flat.directive';
import { RedDirective } from './directives/red.directive';

@NgModule({
  declarations: [
    ButtonComponent,
    CheckboxComponent,
    RadioButtonGroupComponent,
    FilterSelectorComponent,
    TextboxComponent,
    LightboxComponent,
    SvgIconComponent,
    DropdownComponent,
    SliderComponent,
    FlatDirective,
    RedDirective
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    PopoverModule
  ],
  exports: [
    ButtonComponent,
    CheckboxComponent,
    RadioButtonGroupComponent,
    FilterSelectorComponent,
    TextboxComponent,
    LightboxComponent,
    SvgIconComponent,
    DropdownComponent,
    SliderComponent,
    FlatDirective,
    RedDirective,
    CommonModule,
    RouterModule,
    FormsModule,
    PopoverModule
  ]
})

export class SharedModule { }
