import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  Input,
  OnDestroy,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { CoreValidators } from '@app/core';
import { unsubscribeSafely } from '@app/utilities';

import { FormFieldBaseComponent2 } from '../abstraction/form-field.base';
import { IFieldInputUrl } from './field-input-url';

@Component({
  selector: 'mcs-field-input-url',
  templateUrl: './field-input-url.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'mcs-field-input-url'
  }
})
export class FieldInputUrlComponent
  extends FormFieldBaseComponent2<string>
  implements IFieldInputUrl, OnDestroy {

  @Input()
  public minLength: number;

  @Input()
  public maxLength: number;

  @ViewChild('inputField')
  public inputField: ElementRef<HTMLInputElement>;

  constructor(_injector: Injector) {
    super(_injector);
    this.registerCustomValidators(CoreValidators.url);
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this.destroySubject);
  }

  public get displayedStartHint(): string {
    return this.startHint || this._getStartHint();
  }

  public get displayedEndHint(): string {
    return this.endHint || this._getEndHint();
  }

  private _getStartHint(): string {
    if (!this.maxLength && !this.minLength) { return null; }

    return this.maxLength > 0 ?
      this.translate.instant('message.maxLength', { count: this.maxLength }) :
      this.translate.instant('message.minLength', { count: this.minLength });
  }

  private _getEndHint(): string {
    if (!this.maxLength && !this.minLength) { return null; }

    return this.maxLength > 0 ?
      `${this.inputField?.nativeElement.value?.length} / ${this.maxLength}` :
      `${this.inputField?.nativeElement.value?.length} / ${this.minLength}`;
  }
}