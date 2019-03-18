import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  McsFieldHintType,
  isNullOrEmpty
} from '@app/utilities';

@Component({
  selector: 'mcs-hint-message',
  template: '<span>{{ convertedTextContent }}</span>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'hint-message-wrapper'
  }
})

export class HintMessageComponent {

  @Input()
  public type: McsFieldHintType;
  public get typeString(): string {
    return isNullOrEmpty(this.type) ? 'maxChar' : this.type.toString();
  }

  @Input()
  public value: string;
  public get valueString(): string {
    return isNullOrEmpty(this.value) ? '' : this.value;
  }

  /**
   * Returns the maximum character text content
   */
  public get convertedTextContent(): string {
    let translateKey = 'shared.formField.hints.' + this.typeString;
    return this._translateService.instant(translateKey, { 'value': this.valueString.toString() });
  }

  constructor(private _translateService: TranslateService) { }
}
