import {
  Pipe,
  PipeTransform
} from '@angular/core';
import {
  CoreDefinition,
  McsUnitType
} from '../../core';
import {
  isNullOrEmpty,
  appendUnitSuffix
} from '../../utilities';

@Pipe({
  name: 'mcsFileSize'
})

export class FileSizePipe implements PipeTransform {
  private _units = [
    McsUnitType.Kilobyte,
    McsUnitType.Megabyte,
    McsUnitType.Gigabyte
  ];

  public transform(sizeKB: number): string {
    if (isNullOrEmpty(sizeKB)) { return ''; }

    let unitIndex = 0;

    while (sizeKB >= CoreDefinition.MB_TO_KB_MULTIPLIER) {
      sizeKB /= CoreDefinition.MB_TO_KB_MULTIPLIER;
      unitIndex++;
    }

    return appendUnitSuffix(Math.round(sizeKB), this._units[unitIndex]);
  }
}
