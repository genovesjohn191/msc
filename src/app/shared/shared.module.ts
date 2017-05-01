import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
/** Modules */
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PopoverModule } from './popover/popover.module';
/** Components */
import { ButtonComponent } from './button/button.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { FilterSelectorComponent } from './filter-selector/filter-selector.component';
import { StatusBoxComponent } from './status-box/status-box.component';
import { TextboxComponent } from './textbox/textbox.component';
import { LightboxComponent } from './lightbox/lightbox.component';
/** Directives */
import { FlatDirective } from './directives/flat.directive';
import { RedDirective } from './directives/red.directive';

@NgModule({
  declarations: [
    ButtonComponent,
    CheckboxComponent,
    FilterSelectorComponent,
    StatusBoxComponent,
    TextboxComponent,
    FlatDirective,
    RedDirective,
    LightboxComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PopoverModule,
    NgbModule
  ],
  exports: [
    ButtonComponent,
    CheckboxComponent,
    FilterSelectorComponent,
    StatusBoxComponent,
    TextboxComponent,
    LightboxComponent,
    FlatDirective,
    RedDirective,
    CommonModule,
    FormsModule,
    PopoverModule,
    NgbModule
  ]
})

export class SharedModule { }
