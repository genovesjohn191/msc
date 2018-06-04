import { NgModule } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { NewLinesPipe } from './new-lines.pipe';
import { MapIterablePipe } from './map-iterable.pipe';
import { DataSizePipe } from './data-size.pipe';
import { SortArrayPipe } from './sort-array.pipe';
import { DataLabelPipe } from './data-label.pipe';
import { StdDateFormatPipe } from './std-date-format.pipe';
import { ArrayTakeMaxPipe } from './array-take-max.pipe';

@NgModule({
  declarations: [
    NewLinesPipe,
    MapIterablePipe,
    DataSizePipe,
    SortArrayPipe,
    DataLabelPipe,
    StdDateFormatPipe,
    ArrayTakeMaxPipe
  ],
  exports: [
    NewLinesPipe,
    MapIterablePipe,
    DataSizePipe,
    SortArrayPipe,
    DataLabelPipe,
    StdDateFormatPipe,
    ArrayTakeMaxPipe
  ],
  providers: [
    DecimalPipe,
    StdDateFormatPipe
  ]
})

export class PipesModule { }
