import {
  Pipe,
  PipeTransform
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  isNullOrEmpty,
  McsDataSizeType
} from '@app/utilities';

@Pipe({
  name: 'mcsDataSize'
})

export class DataSizePipe implements PipeTransform {
  private _byteMultiplierTable = new Map<McsDataSizeType, number>();
  private _unitTable: McsDataSizeType[] = [
    'B',
    'KB',
    'MB',
    'GB',
    'TB'
  ];

  constructor(private _decimalPipe: DecimalPipe) {
    this._createUnitSizeTable();
  }

  /**
   * Transform the given data size based onthe datasize unit
   * @param dataSize Data size to be converted
   * @param dataSizeUnit Data unit to be the basis of the datasize, the default value is Kilobyte
   */
  public transform(dataSize: number, dataSizeUnit: McsDataSizeType = 'KB'): string {
    if (dataSize < 1) {
      return `${this._decimalPipe.transform(dataSize, '1.0-2')} ${dataSizeUnit}`;
    }
    if (isNullOrEmpty(dataSize)) { return `Unknown`; }

    let sizeInBytes: number = this._convertDataSizeToByte(dataSize, dataSizeUnit);
    let unitIndex = 0;
    while (sizeInBytes >= 1024) {
      sizeInBytes /= 1024;
      unitIndex++;
    }
    unitIndex = Math.min(unitIndex, (this._unitTable.length - 1));
    return `${this._decimalPipe.transform(sizeInBytes, '1.0-2')} ${this._unitTable[unitIndex]}`;
  }

  /**
   * Converts the data size to Bytes
   * @param dataSize Datasize to be converted
   * @param dataSizeUnit Data unit size of the current data size
   */
  private _convertDataSizeToByte(dataSize: number, dataSizeUnit: McsDataSizeType): number {
    let foundDataUnit = this._byteMultiplierTable.get(dataSizeUnit);
    return isNullOrEmpty(foundDataUnit) ? dataSize : dataSize * foundDataUnit;
  }

  /**
   * Create Unit Size Table for Bytes support
   */
  private _createUnitSizeTable(): void {
    this._byteMultiplierTable.set('B', 1);
    this._byteMultiplierTable.set('KB', 1024);
    this._byteMultiplierTable.set('MB', Math.pow(1024, 2));
    this._byteMultiplierTable.set('GB', Math.pow(1024, 3));
    this._byteMultiplierTable.set('TB', Math.pow(1024, 4));
  }
}
