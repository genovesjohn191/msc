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
import { unsubscribeSafely } from '@app/utilities';

import { FormFieldBaseComponent2 } from '../abstraction/form-field.base';
import { IFieldInput } from './field-input';

@Component({
  selector: 'mcs-field-input',
  templateUrl: './field-input.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'mcs-field-input'
  }
})
export class FieldInputComponent
  extends FormFieldBaseComponent2<string>
  implements IFieldInput, OnDestroy {

  @Input()
  public minLength: number;

  @Input()
  public maxLength: number;

  @ViewChild('inputField')
  public inputField: ElementRef<HTMLInputElement>;

  constructor(_injector: Injector) {
    super(_injector);
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