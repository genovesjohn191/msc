import { NgModule } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { NewLinesPipe } from './new-lines.pipe';
import { MapIterablePipe } from './map-iterable.pipe';
import { DataSizePipe } from './data-size.pipe';
import { SortArrayPipe } from './sort-array.pipe';
import { DataLabelPipe } from './data-label.pipe';

@NgModule({
  declarations: [
    NewLinesPipe,
    MapIterablePipe,
    DataSizePipe,
    SortArrayPipe,
    DataLabelPipe
  ],
  exports: [
    NewLinesPipe,
    MapIterablePipe,
    DataSizePipe,
    SortArrayPipe,
    DataLabelPipe
  ],
  providers: [DecimalPipe]
})

export class PipesModule { }
