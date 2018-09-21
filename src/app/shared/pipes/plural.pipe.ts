import {
  Pipe,
  PipeTransform
} from '@angular/core';
import {
  getRecordCountLabel,
  isNullOrEmpty
} from '@app/utilities';

@Pipe({
  name: 'mcsPlural'
})

export class PluralPipe implements PipeTransform {

  /**
   * Append appropriate label for count according to its size
   * @param count count value that needs to have label
   * @param singular Singular label
   * @param plural Plural label
   */
  public transform(count: number, singular: string, plural?: string ): string {
    if (isNullOrEmpty(plural)) { plural = singular + 's'; }
    return getRecordCountLabel(count, singular, plural);
  }
}
