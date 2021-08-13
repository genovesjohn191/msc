import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  Input,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { FieldErrorMessage } from '@app/models';
import { FormFieldBaseComponent2 } from '../abstraction/form-field.base';
import { IFieldInputNumberArrow } from './field-input-number-arrow';

@Component({
  selector: 'mcs-field-input-number-arrow',
  templateUrl: './field-input-number-arrow.component.html',
  styleUrls: ['./field-input-number-arrow.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'mcs-field-input-number-arrow'
  }
})
export class FieldInputNumberArrowComponent
  extends FormFieldBaseComponent2<number>
  implements IFieldInputNumberArrow, OnInit {

  @Input()
    maxValue: number;
  @Input()
    minValue: number;
  @Input()
    errorMessage: FieldErrorMessage;
  @Input()
    suffix: string;
  @Input()
    mcsId: string;
  @Input()
    eventCategory: string;
  @Input()
    eventLabel: string;
  @Input()
    eventTracker: string;

  private _inputValue: number;
  private _arrowInterval: any;

  constructor(_injector: Injector) {
    super(_injector);
  }

  public get valueIsmax(): boolean {
    return this._inputValue >= this.maxValue;
  }

  public get valueIsMin(): boolean {
    return this._inputValue <= this.minValue;
  }

  public ngOnInit(): void {
    this._inputValue = this.ngControl.control.value;
  }

  public inputInvalid(value: number): boolean {
    return !Number.isInteger(+value);
  }

  public onEnterKeyUpEvent(value: number): void {
    this._inputValue = +value;
  }

  public onArrowUpClickEvent(): void {
    this._inputValue = +this.ngControl.control.value + 1;
    this.ngControl.control.setValue(this._inputValue);
  }

  public onArrowUpMouseDownEvent(value: number): void {
    this._arrowInterval = setInterval(() => {
      this._inputValue = value ++;
      this.ngControl.control.setValue(this._inputValue);
      if (this.valueIsmax) {
        this.clearInterval()
      }
    }, 50);
  }

  public onArrowDownClickEvent(): void {
    this._inputValue = +this.ngControl.control.value - 1;
    this.ngControl.control.setValue(this._inputValue);
  }

  public onArrowDownMouseDownEvent(value: number): void {
    this._arrowInterval = setInterval(() => {
      this._inputValue = value --;
      this.ngControl.control.setValue(this._inputValue);
      if (this.valueIsMin) {
        this.clearInterval();
      }
    }, 50);
  }

  public clearInterval(): void {
    clearInterval(this._arrowInterval);
  }
}