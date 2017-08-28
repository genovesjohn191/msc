import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from './table.component';
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

/** Column */
import { ColumnDefDirective } from './column';

/** Shared */
import {
  CellOutletDirective,
  DataPlaceholderDirective,
  HeaderPlaceholderDirective
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
    DataPlaceholderDirective,
    HeaderPlaceholderDirective
  ],
  imports: [
    CommonModule
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
    DataPlaceholderDirective,
    HeaderPlaceholderDirective
  ]
})

export class TableModule { }
