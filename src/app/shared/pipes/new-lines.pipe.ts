import {
  Pipe,
  PipeTransform
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'mcsNewLines'
})

export class NewLinesPipe implements PipeTransform {
  constructor(private _sanitizer: DomSanitizer) { }

  public transform(value: any): any {
    let result;
    if (value) {
      result = value.replace(/(?:\r\n|\r|\n)/g, '<br />');
      result = this._sanitizer.bypassSecurityTrustHtml(result);
    }
    return result ? result : value;
  }
}
