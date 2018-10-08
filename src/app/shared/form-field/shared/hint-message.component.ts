import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { McsTextContentProvider } from '@app/core';
import {
  replacePlaceholder,
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

export class HintMessageComponent implements OnInit {

  public textContent: any;

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
    return replacePlaceholder(
      this.textContent[this.typeString],
      'value', this.valueString.toString()
    );
  }

  constructor(private _textContentProvider: McsTextContentProvider) { }

  public ngOnInit(): void {
    this.textContent = this._textContentProvider.content.shared.formField.hints;
  }
}
