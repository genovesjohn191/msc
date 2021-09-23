import {
  Pipe,
  PipeTransform
} from '@angular/core';
import { currencyFormat } from '@app/utilities';

@Pipe({
  name: 'mcsStdCurrencyFormat'
})
export class StdCurrencyFormatPipe implements PipeTransform {

  public transform(value: number): any {
    return currencyFormat(value);
  }
}
