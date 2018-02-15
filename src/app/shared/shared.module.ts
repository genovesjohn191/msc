import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
/** Modules */
import { RippleModule } from './ripple/ripple.module';
import { LayoutModule } from './layout/layout.module';
import { ButtonModule } from './button/button.module';
import { CheckboxModule } from './checkbox/checkbox.module';
import { FilterSelectorModule } from './filter-selector/filter-selector.module';
import { PopoverModule } from './popover/popover.module';
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
import { AttachmentModule } from './attachment/attachment.module';
import { PaginatorModule } from './paginator/paginator.module';
import { ActionItemModule } from './action-item/action-item.module';
import { RadioButtonGroupModule } from './radio-button-group/radio-button-group.module';
import { FormFieldModule } from './form-field/form-field.module';
import { InputModule } from './input/input.module';
import { SearchModule } from './search/search.module';
import { SliderModule } from './slider/slider.module';
import { TagListModule } from './tag-list/tag-list.module';
import { SelectTagModule } from './select-tag/select-tag.module';
import { CommentBoxModule } from './comment-box/comment-box.module';
import { DataStatusModule } from './data-status/data-status.module';
/** Components */
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { AlertComponent } from './alert/alert.component';
import { CapacityBarComponent } from './capacity-bar/capacity-bar.component';
/** Directives */
import { HasPermissionDirective } from './authentication/has-permission.directive';

@NgModule({
  declarations: [
    ProgressBarComponent,
    AlertComponent,
    HasPermissionDirective,
    CapacityBarComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    RippleModule,
    LayoutModule,
    PopoverModule,
    IconModule,
    ButtonModule,
    CheckboxModule,
    FilterSelectorModule,
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
    WizardModule,
    AttachmentModule,
    PaginatorModule,
    ActionItemModule,
    RadioButtonGroupModule,
    FormFieldModule,
    InputModule,
    SearchModule,
    SliderModule,
    TagListModule,
    SelectTagModule,
    CommentBoxModule,
    DataStatusModule
  ],
  exports: [
    ProgressBarComponent,
    AlertComponent,
    HasPermissionDirective,
    CapacityBarComponent,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    RippleModule,
    LayoutModule,
    PopoverModule,
    IconModule,
    ButtonModule,
    CheckboxModule,
    FilterSelectorModule,
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
    WizardModule,
    AttachmentModule,
    PaginatorModule,
    ActionItemModule,
    RadioButtonGroupModule,
    FormFieldModule,
    InputModule,
    SearchModule,
    SliderModule,
    TagListModule,
    SelectTagModule,
    CommentBoxModule,
    DataStatusModule
  ]
})

export class SharedModule { }
