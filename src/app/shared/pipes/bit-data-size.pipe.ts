import {
  Pipe,
  PipeTransform
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  isNullOrEmpty,
  McsBitDataSizeType,
} from '@app/utilities';

@Pipe({
  name: 'mcsBitDataSize'
})

export class BitDataSizePipe implements PipeTransform {
  private _bitMultiplierTable = new Map<McsBitDataSizeType, number>();
  private _unitTable: McsBitDataSizeType[] = [
    'Mb',
    'Gb'
  ];

  constructor(private _decimalPipe: DecimalPipe) {
    this._createUnitSizeTable();
  }

  /**
   * Transform the given data size based on the datasize unit
   * @param dataSize Data size to be converted
   * @param dataSizeUnit Data unit to be the basis of the datasize, the default value is Megabits
   */
  public transform(dataSize: number, dataSizeUnit: McsBitDataSizeType = 'Mb'): string {
    if (dataSize < 1) {
      return `${this._decimalPipe.transform(dataSize, '1.0-2')} ${dataSizeUnit}`;
    }
    if (isNullOrEmpty(dataSize)) { return `Unknown`; }

    let sizeInBits: number = this._convertDataSizeToBit(dataSize, dataSizeUnit);
    let unitIndex = 0;
    while (sizeInBits >= 1000) {
      sizeInBits /= 1000;
      unitIndex++;
    }
    unitIndex = Math.min(unitIndex, (this._unitTable.length - 1));
    return `${this._decimalPipe.transform(sizeInBits, '1.0-2')} ${this._unitTable[unitIndex]}`;
  }

  /**
   * Converts the data size to Bits
   * @param dataSize Datasize to be converted
   * @param dataSizeUnit Data unit size of the current data size
   */
  private _convertDataSizeToBit(dataSize: number, dataSizeUnit: McsBitDataSizeType): number {
    let foundDataUnit = this._bitMultiplierTable.get(dataSizeUnit);
    return isNullOrEmpty(foundDataUnit) ? dataSize : dataSize * foundDataUnit;
  }

  /**
   * Create Unit Size Table for Bits support
   */
  private _createUnitSizeTable(): void {
    this._bitMultiplierTable.set('Mb', 1);
    this._bitMultiplierTable.set('Gb', 1000);
  }
}