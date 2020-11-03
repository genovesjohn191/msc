import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { AccordionModule } from './accordion/accordion.module';
import { ActionItemModule } from './action-item/action-item.module';
import { AlertModule } from './alert/alert.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { BusyRibbonModule } from './busy-ribbon/busy-ribbon.module';
import { ButtonModule } from './button/button.module';
import { CapacityBarModule } from './capacity-bar/capacity-bar.module';
import { ChartModule } from './chart/chart.module';
import { CheckboxModule } from './checkbox/checkbox.module';
import { CollapsiblePanelModule } from './collapsible-panel/collapsible-panel.module';
import { ColumnFilterModule } from './column-filter/column-filter.module';
import { CommentBoxModule } from './comment-box/comment-box.module';
import { ContextualHelpModule } from './contextual-help/contextual-help.module';
import { CtaListModule } from './cta-list/cta-list.module';
import { DataStatusModule } from './data-status/data-status.module';
import { DateTimePickerModule } from './datetimepicker/datetimepicker.module';
import { DialogModule } from './dialog/dialog.module';
import { DirectivesModule } from './directives';
import { DividerModule } from './divider/divider.module';
import { DynamicListModule } from './dynamic-list/dynamic-list.module';
import { EventTrackerModule } from './event-tracker/event-tracker.module';
import { FileAttachmentModule } from './file-attachment/file-attachment.module';
import { FileDownloadModule } from './file-download/file-download.module';
import { FormFieldModule } from './form-field/form-field.module';
import { FormMessageModule } from './form-message/form-message.module';
import { GridModule } from './grid/grid.module';
import { IconModule } from './icon/icon.module';
import { ImageModule } from './image/image.module';
import { InputModule } from './input/input.module';
import { ItemModule } from './item/item.module';
import { JobsProvisioningModule } from './jobs-provisioning/jobs-provisioning.module';
import { ListPanelModule } from './list-panel/list-panel.module';
import { ListModule } from './list/list.module';
import { LoaderModule } from './loader/loader.module';
import { LoadingModule } from './loading/loading.module';
import { NoteModule } from './note/note.module';
import { OptionGroupModule } from './option-group/option-group.module';
import { OverlayModule } from './overlay/overlay.module';
import { PageModule } from './page/page.module';
import { PaginatorModule } from './paginator/paginator.module';
import { PipesModule } from './pipes';
import { PopoverModule } from './popover/popover.module';
import { PresentationPanelModule } from './presentation-panel/presentation-panel.module';
import { PricingCalculatorModule } from './pricing-calculator/pricing-calculator.module';
import { ProgressBarModule } from './progress-bar/progress-bar.module';
import { RadioButtonGroupModule } from './radio-button-group/radio-button-group.module';
import { ResponsivePanelModule } from './responsive-panel/responsive-panel.module';
/** Modules */
import { RippleModule } from './ripple/ripple.module';
import { ScrollableLinkGroupModule } from './scrollable-link-group/scrollable-link-group.module';
import { SearchModule } from './search/search.module';
import { SectionModule } from './section/section.module';
import { SelectTagModule } from './select-tag/select-tag.module';
import { SelectModule } from './select/select.module';
import { SliderModule } from './slider/slider.module';
import { SlidingPanelModule } from './sliding-panel/sliding-panel.module';
import { SnackBarModule } from './snack-bar/snack-bar.module';
import { StatusMessageModule } from './status-message/status-message.module';
import { TabGroupModule } from './tab-group/tab-group.module';
import { TableModule } from './table/table.module';
import { TagListModule } from './tag-list/tag-list.module';
import { TooltipModule } from './tooltip/tooltip.module';
import { TreeModule } from './tree/tree.module';
import { WidgetsModule } from './widgets/widgets.module';
import { WizardModule } from './wizard/wizard.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    PipesModule,
    DirectivesModule,
    RippleModule,
    PopoverModule,
    IconModule,
    AlertModule,
    ImageModule,
    GridModule,
    ButtonModule,
    ChartModule,
    CheckboxModule,
    ColumnFilterModule,
    TableModule,
    ListPanelModule,
    LoaderModule,
    PageModule,
    ContextualHelpModule,
    OptionGroupModule,
    SelectModule,
    AccordionModule,
    ListModule,
    OverlayModule,
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
    FormMessageModule,
    InputModule,
    SearchModule,
    SliderModule,
    TagListModule,
    SelectTagModule,
    CommentBoxModule,
    DataStatusModule,
    StatusMessageModule,
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
    TreeModule,
    SectionModule,
    PricingCalculatorModule,
    DynamicListModule,
    DateTimePickerModule,
    CtaListModule,

    // Angular Material
    MatBadgeModule,
    MatButtonModule,
    MatBottomSheetModule,
    MatButtonToggleModule,
    MatCardModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatOptionModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatTooltipModule,
    MatTreeModule
  ],
  exports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    PipesModule,
    DirectivesModule,
    RippleModule,
    PopoverModule,
    IconModule,
    AlertModule,
    ImageModule,
    GridModule,
    ButtonModule,
    ChartModule,
    CheckboxModule,
    ColumnFilterModule,
    TableModule,
    ListPanelModule,
    LoaderModule,
    PageModule,
    ContextualHelpModule,
    OptionGroupModule,
    SelectModule,
    AccordionModule,
    ListModule,
    OverlayModule,
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
    FormMessageModule,
    InputModule,
    SearchModule,
    SliderModule,
    TagListModule,
    SelectTagModule,
    CommentBoxModule,
    DataStatusModule,
    StatusMessageModule,
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
    TreeModule,
    SectionModule,
    PricingCalculatorModule,
    DynamicListModule,
    DateTimePickerModule,
    CtaListModule,

    // Angular Material
    MatBadgeModule,
    MatButtonModule,
    MatBottomSheetModule,
    MatButtonToggleModule,
    MatCardModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatOptionModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatTooltipModule,
    MatTreeModule
  ]
})

export class SharedModule { }
