import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
/** Modules */
import { RippleModule } from './ripple/ripple.module';
import { GridModule } from './grid/grid.module';
import { ButtonModule } from './button/button.module';
import { CheckboxModule } from './checkbox/checkbox.module';
import { FilterSelectorModule } from './filter-selector/filter-selector.module';
import { PopoverModule } from './popover/popover.module';
import { IconModule } from './icon/icon.module';
import { AlertModule } from './alert/alert.module';
import { ImageModule } from './image/image.module';
import { TableModule } from './table/table.module';
import { ListPanelModule } from './list-panel/list-panel.module';
import { LoaderModule } from './loader/loader.module';
import { PageModule } from './page/page.module';
import { ContextualHelpModule } from './contextual-help/contextual-help.module';
import { OptionGroupModule } from './option-group/option-group.module';
import { SelectModule } from './select/select.module';
import { AccordionModule } from './accordion/accordion.module';
import { ListModule } from './list/list.module';
import { DialogModule } from './dialog/dialog.module';
import { SnackBarModule } from './snack-bar/snack-bar.module';
import { TooltipModule } from './tooltip/tooltip.module';
import { TabGroupModule } from './tab-group/tab-group.module';
import { ScrollableLinkGroupModule } from './scrollable-link-group/scrollable-link-group.module';
import { WizardModule } from './wizard/wizard.module';
import { WidgetsModule } from './widgets/widgets.module';
import { FileAttachmentModule } from './file-attachment/file-attachment.module';
import { PaginatorModule } from './paginator/paginator.module';
import { ActionItemModule } from './action-item/action-item.module';
import { SlidingPanelModule } from './sliding-panel/sliding-panel.module';
import { ResponsivePanelModule } from './responsive-panel/responsive-panel.module';
import { CollapsiblePanelModule } from './collapsible-panel/collapsible-panel.module';
import { RadioButtonGroupModule } from './radio-button-group/radio-button-group.module';
import { FormFieldModule } from './form-field/form-field.module';
import { InputModule } from './input/input.module';
import { SearchModule } from './search/search.module';
import { SliderModule } from './slider/slider.module';
import { TagListModule } from './tag-list/tag-list.module';
import { SelectTagModule } from './select-tag/select-tag.module';
import { CommentBoxModule } from './comment-box/comment-box.module';
import { DataStatusModule } from './data-status/data-status.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { ProgressBarModule } from './progress-bar/progress-bar.module';
import { CapacityBarModule } from './capacity-bar/capacity-bar.module';
import { PipesModule } from './pipes';
import { DirectivesModule } from './directives';
import { FileDownloadModule } from './file-download/file-download.module';
import { EventTrackerModule } from './event-tracker/event-tracker.module';
import { BusyRibbonModule } from './busy-ribbon/busy-ribbon.module';
import { NoteModule } from './note/note.module';
import { PresentationPanelModule } from './presentation-panel/presentation-panel.module';
import { JobsProvisioningModule } from './jobs-provisioning/jobs-provisioning.module';
import { LoadingModule } from './loading/loading.module';
import { ItemModule } from './item/item.module';
import { DividerModule } from './divider/divider.module';
import { TreeModule } from './tree/tree.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule,
    DirectivesModule,
    RippleModule,
    PopoverModule,
    IconModule,
    AlertModule,
    ImageModule,
    GridModule,
    ButtonModule,
    CheckboxModule,
    FilterSelectorModule,
    TableModule,
    ListPanelModule,
    LoaderModule,
    PageModule,
    ContextualHelpModule,
    OptionGroupModule,
    SelectModule,
    AccordionModule,
    ListModule,
    DialogModule,
    SnackBarModule,
    TooltipModule,
    TabGroupModule,
    ScrollableLinkGroupModule,
    WizardModule,
    WidgetsModule,
    FileAttachmentModule,
    PaginatorModule,
    ActionItemModule,
    SlidingPanelModule,
    ResponsivePanelModule,
    CollapsiblePanelModule,
    RadioButtonGroupModule,
    FormFieldModule,
    InputModule,
    SearchModule,
    SliderModule,
    TagListModule,
    SelectTagModule,
    CommentBoxModule,
    DataStatusModule,
    AuthenticationModule,
    ProgressBarModule,
    CapacityBarModule,
    FileDownloadModule,
    EventTrackerModule,
    BusyRibbonModule,
    NoteModule,
    PresentationPanelModule,
    JobsProvisioningModule,
    LoadingModule,
    ItemModule,
    DividerModule,
    TreeModule
  ],
  exports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule,
    DirectivesModule,
    RippleModule,
    PopoverModule,
    IconModule,
    AlertModule,
    ImageModule,
    GridModule,
    ButtonModule,
    CheckboxModule,
    FilterSelectorModule,
    TableModule,
    ListPanelModule,
    LoaderModule,
    PageModule,
    ContextualHelpModule,
    OptionGroupModule,
    SelectModule,
    AccordionModule,
    ListModule,
    DialogModule,
    SnackBarModule,
    TooltipModule,
    TabGroupModule,
    ScrollableLinkGroupModule,
    WizardModule,
    WidgetsModule,
    FileAttachmentModule,
    PaginatorModule,
    ActionItemModule,
    SlidingPanelModule,
    ResponsivePanelModule,
    CollapsiblePanelModule,
    RadioButtonGroupModule,
    FormFieldModule,
    InputModule,
    SearchModule,
    SliderModule,
    TagListModule,
    SelectTagModule,
    CommentBoxModule,
    DataStatusModule,
    AuthenticationModule,
    ProgressBarModule,
    CapacityBarModule,
    FileDownloadModule,
    EventTrackerModule,
    BusyRibbonModule,
    NoteModule,
    PresentationPanelModule,
    JobsProvisioningModule,
    LoadingModule,
    ItemModule,
    DividerModule,
    TreeModule
  ]
})

export class SharedModule { }
