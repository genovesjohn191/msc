import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { unsubscribeSafely } from '@app/utilities';

import { FormFieldBaseComponent2 } from '../abstraction/form-field.base';
import { IFieldInputTextarea } from './field-input-textarea';

@Component({
  selector: 'mcs-field-input-textarea',
  templateUrl: './field-input-textarea.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'mcs-field-input-textarea'
  }
})
export class FieldInputTextareaComponent
  extends FormFieldBaseComponent2<string>
  implements IFieldInputTextarea, OnInit, OnDestroy {

  @Input()
  public minLength: number;

  @Input()
  public maxLength: number;

  @ViewChild('textareaField')
  public textareaField: ElementRef<HTMLTextAreaElement>;

  constructor(_injector: Injector) {
    super(_injector);
  }

  public ngOnInit(): void {
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
      `${this.textareaField?.nativeElement.value?.length} / ${this.maxLength}` :
      `${this.textareaField?.nativeElement.value?.length} / ${this.minLength}`;
  }
}