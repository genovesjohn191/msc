import { NgModule } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { NewLinesPipe } from './new-lines.pipe';
import { MapIterablePipe } from './map-iterable.pipe';
import { DataSizePipe } from './data-size.pipe';
import { SortArrayPipe } from './sort-array.pipe';
import { DataLabelPipe } from './data-label.pipe';
import { StdDateFormatPipe } from './std-date-format.pipe';
import { ArrayTakeMaxPipe } from './array-take-max.pipe';
import { PluralPipe } from './plural.pipe';
import { TextPlaceholderPipe } from './text-placeholder.pipe';
import { IsNullOrEmptyPipe } from './is-null-or-empty.pipe';

@NgModule({
  declarations: [
    NewLinesPipe,
    MapIterablePipe,
    DataSizePipe,
    SortArrayPipe,
    DataLabelPipe,
    StdDateFormatPipe,
    ArrayTakeMaxPipe,
    PluralPipe,
    TextPlaceholderPipe,
    IsNullOrEmptyPipe
  ],
  exports: [
    NewLinesPipe,
    MapIterablePipe,
    DataSizePipe,
    SortArrayPipe,
    DataLabelPipe,
    StdDateFormatPipe,
    ArrayTakeMaxPipe,
    PluralPipe,
    TextPlaceholderPipe,
    IsNullOrEmptyPipe
  ],
  providers: [
    DecimalPipe,
    StdDateFormatPipe
  ]
})

export class PipesModule { }
