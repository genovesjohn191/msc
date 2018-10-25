import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from './table.component';
import { LoaderModule } from '../loader/loader.module';
/** Header */
import {
  HeaderCellComponent,
  HeaderRowComponent,
  HeaderCellDefDirective,
  HeaderRowDefDirective
} from './header';
/** Data */
import {
  DataCellComponent,
  DataRowComponent,
  DataCellDefDirective,
  DataRowDefDirective
} from './data';
/** Data status */
import {
  DataEmptyComponent,
  DataErrorComponent,
  DataEmptyDefDirective,
  DataErrorDefDirective,
  DataStatusDefDirective
} from './data-status';
/** Column */
import { ColumnDefDirective } from './column';
/** Shared */
import {
  CellOutletDirective,
  HeaderPlaceholderDirective,
  DataPlaceholderDirective,
  DataStatusPlaceholderDirective,
} from './shared';

@NgModule({
  declarations: [
    TableComponent,
    HeaderCellComponent,
    HeaderRowComponent,
    DataCellComponent,
    DataRowComponent,
    HeaderCellDefDirective,
    HeaderRowDefDirective,
    DataCellDefDirective,
    DataRowDefDirective,
    CellOutletDirective,
    ColumnDefDirective,
    DataEmptyComponent,
    DataErrorComponent,
    DataEmptyDefDirective,
    DataErrorDefDirective,
    DataStatusDefDirective,
    HeaderPlaceholderDirective,
    DataPlaceholderDirective,
    DataStatusPlaceholderDirective
  ],
  imports: [
    CommonModule,
    LoaderModule
  ],
  exports: [
    TableComponent,
    HeaderCellComponent,
    HeaderRowComponent,
    DataCellComponent,
    DataRowComponent,
    HeaderCellDefDirective,
    HeaderRowDefDirective,
    DataCellDefDirective,
    DataRowDefDirective,
    CellOutletDirective,
    ColumnDefDirective,
    DataEmptyComponent,
    DataErrorComponent,
    DataEmptyDefDirective,
    DataErrorDefDirective,
    DataStatusDefDirective,
    HeaderPlaceholderDirective,
    DataPlaceholderDirective,
    DataStatusPlaceholderDirective
  ]
})

export class TableModule { }
