import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
/** Grid */
import { GridComponent } from './grid.component';
import { GridRowComponent } from './grid-row/grid-row.component';
import { GridColumnComponent } from './grid-column/grid-column.component';

@NgModule({
  declarations: [
    GridComponent,
    GridRowComponent,
    GridColumnComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    GridComponent,
    GridRowComponent,
    GridColumnComponent,
    CommonModule
  ]
})

export class GridModule { }
