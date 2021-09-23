import { DecimalPipe } from '@angular/common';
import { NgModule } from '@angular/core';

import { ArrayCommaSeparatorPipe } from './array-comma-separator.pipe';
import { ArrayHasElement } from './array-has-element.pipe';
import { ArrayTakeMaxPipe } from './array-take-max.pipe';
import { BitDataSizePipe } from './bit-data-size.pipe';
import { DataLabelPipe } from './data-label.pipe';
import { DataSizePipe } from './data-size.pipe';
import { IsNotNullOrEmptyPipe } from './is-not-null-or-empty.pipe';
import { IsNotNullOrUndefinedPipe } from './is-not-null-or-undefined.pipe';
import { MapIterablePipe } from './map-iterable.pipe';
import { NewLinesPipe } from './new-lines.pipe';
import { PluralPipe } from './plural.pipe';
import { SafeHtmlPipe } from './safe-html.pipe';
import { SortArrayPipe } from './sort-array.pipe';
import { StdCurrencyFormatPipe } from './std-currency-format.pipe';
import { StdDateFormatPipe } from './std-date-format.pipe';
import { TextPhoneNumberFormatPipe } from './text-phonenumber-format.pipe';
import { TextPlaceholderPipe } from './text-placeholder.pipe';

@NgModule({
  declarations: [
    NewLinesPipe,
    MapIterablePipe,
    DataSizePipe,
    BitDataSizePipe,
    SortArrayPipe,
    DataLabelPipe,
    StdDateFormatPipe,
    ArrayTakeMaxPipe,
    ArrayCommaSeparatorPipe,
    SafeHtmlPipe,
    PluralPipe,
    TextPlaceholderPipe,
    IsNotNullOrEmptyPipe,
    IsNotNullOrUndefinedPipe,
    ArrayHasElement,
    TextPhoneNumberFormatPipe,
    StdCurrencyFormatPipe
  ],
  exports: [
    NewLinesPipe,
    MapIterablePipe,
    DataSizePipe,
    BitDataSizePipe,
    SortArrayPipe,
    DataLabelPipe,
    StdDateFormatPipe,
    ArrayTakeMaxPipe,
    ArrayCommaSeparatorPipe,
    SafeHtmlPipe,
    PluralPipe,
    TextPlaceholderPipe,
    IsNotNullOrEmptyPipe,
    IsNotNullOrUndefinedPipe,
    ArrayHasElement,
    TextPhoneNumberFormatPipe,
    StdCurrencyFormatPipe
  ],
  providers: [
    DecimalPipe,
    StdDateFormatPipe,
    StdCurrencyFormatPipe
  ]
})

export class PipesModule { }
