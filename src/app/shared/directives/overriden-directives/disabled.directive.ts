import {
  Directive,
  Input
} from '@angular/core';
import { coerceBoolean } from '@app/utilities';

@Directive({
  selector: '[disabled]',
  host: {
    '[class.disabled-element]': 'disabled',
    '[attr.disabled]': 'disabled ? true : null'
  }
})

export class DisabledDirective {
  @Input()
  public get disabled(): boolean { return this._disabled; }
  public set disabled(value: boolean) { this._disabled = coerceBoolean(value); }
  private _disabled: boolean = false;
}
