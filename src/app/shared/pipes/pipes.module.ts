import { NgModule } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { NewLinesPipe } from './new-lines.pipe';
import { MapIterablePipe } from './map-iterable.pipe';
import { DataSizePipe } from './data-size.pipe';
import { SortArrayPipe } from './sort-array.pipe';
import { DataLabelPipe } from './data-label.pipe';
import { StdDateFormatPipe } from './std-date-format.pipe';
import { ArrayTakeMaxPipe } from './array-take-max.pipe';
import { ArrayCommaSeparatorPipe } from './array-comma-separator.pipe';
import { PluralPipe } from './plural.pipe';
import { TextPlaceholderPipe } from './text-placeholder.pipe';
import { IsNotNullOrEmptyPipe } from './is-not-null-or-empty.pipe';
import { IsNotNullOrUndefinedPipe } from './is-not-null-or-undefined.pipe';
import { ArrayHasElement } from './array-has-element.pipe';

@NgModule({
  declarations: [
    NewLinesPipe,
    MapIterablePipe,
    DataSizePipe,
    SortArrayPipe,
    DataLabelPipe,
    StdDateFormatPipe,
    ArrayTakeMaxPipe,
    ArrayCommaSeparatorPipe,
    PluralPipe,
    TextPlaceholderPipe,
    IsNotNullOrEmptyPipe,
    IsNotNullOrUndefinedPipe,
    ArrayHasElement,
  ],
  exports: [
    NewLinesPipe,
    MapIterablePipe,
    DataSizePipe,
    SortArrayPipe,
    DataLabelPipe,
    StdDateFormatPipe,
    ArrayTakeMaxPipe,
    ArrayCommaSeparatorPipe,
    PluralPipe,
    TextPlaceholderPipe,
    IsNotNullOrEmptyPipe,
    IsNotNullOrUndefinedPipe,
    ArrayHasElement
  ],
  providers: [
    DecimalPipe,
    StdDateFormatPipe
  ]
})

export class PipesModule { }
