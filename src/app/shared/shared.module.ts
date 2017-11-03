import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
/** External modules */
import { FileUploadModule } from 'ng2-file-upload';
/** Modules */
import { LayoutModule } from './layout/layout.module';
import { ButtonModule } from './button/button.module';
import { PopoverModule } from './popover/popover.module';
import { ModalModule } from './modal/modal.module';
import { IconModule } from './icon/icon.module';
import { ValidationMessageModule } from './validation-message/validation-message.module';
import { TableModule } from './table/table.module';
import { ListPanelModule } from './list-panel/list-panel.module';
import { PageHeaderModule } from './page-header/page-header.module';
import { LoaderModule } from './loader/loader.module';
import { PageModule } from './page/page.module';
import { ContextualHelpModule } from './contextual-help';
import { SelectModule } from './select/select.module';
import { AccordionModule } from './accordion/accordion.module';
import { ListModule } from './list/list.module';
import { DialogModule } from './dialog/dialog.module';
import { TooltipModule } from './tooltip/tooltip.module';
import { TabGroupModule } from './tab-group/tab-group.module';
import { WizardModule } from './wizard/wizard.module';
/** Components */
import { CheckboxComponent } from './checkbox/checkbox.component';
import { RadioButtonGroupComponent } from './radio-button-group/radio-button-group.component';
import { FilterSelectorComponent } from './filter-selector/filter-selector.component';
import { TextboxComponent } from './textbox/textbox.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { SliderComponent } from './slider/slider.component';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { AlertComponent } from './alert/alert.component';
import { PaginatorComponent } from './paginator/paginator.component';
import { SearchComponent } from './search/search.component';
import { CapacityBarComponent } from './capacity-bar/capacity-bar.component';
/** Directives */
import { HasPermissionDirective } from './authentication/has-permission.directive';

@NgModule({
  declarations: [
    CheckboxComponent,
    RadioButtonGroupComponent,
    FilterSelectorComponent,
    TextboxComponent,
    DropdownComponent,
    SliderComponent,
    ProgressBarComponent,
    AlertComponent,
    PaginatorComponent,
    HasPermissionDirective,
    SearchComponent,
    CapacityBarComponent
  ],
  imports: [
    FileUploadModule,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    LayoutModule,
    PopoverModule,
    ModalModule,
    IconModule,
    ButtonModule,
    ValidationMessageModule,
    TableModule,
    ListPanelModule,
    PageHeaderModule,
    LoaderModule,
    PageModule,
    ContextualHelpModule,
    SelectModule,
    AccordionModule,
    ListModule,
    DialogModule,
    TooltipModule,
    TabGroupModule,
    WizardModule
  ],
  exports: [
    CheckboxComponent,
    RadioButtonGroupComponent,
    FilterSelectorComponent,
    TextboxComponent,
    DropdownComponent,
    SliderComponent,
    ProgressBarComponent,
    AlertComponent,
    PaginatorComponent,
    HasPermissionDirective,
    SearchComponent,
    CapacityBarComponent,
    FileUploadModule,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    LayoutModule,
    PopoverModule,
    ModalModule,
    IconModule,
    ButtonModule,
    ValidationMessageModule,
    TableModule,
    ListPanelModule,
    PageHeaderModule,
    LoaderModule,
    PageModule,
    ContextualHelpModule,
    SelectModule,
    AccordionModule,
    ListModule,
    DialogModule,
    TooltipModule,
    TabGroupModule,
    WizardModule
  ]
})

export class SharedModule { }
