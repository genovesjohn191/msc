import {
  Component,
  Input,
  TemplateRef,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from '@angular/core';
import { coerceBoolean } from '@app/utilities';

@Component({
  selector: 'mcs-tab-body',
  templateUrl: './tab-body.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'tab-body-wrapper',
    '[class.active]': 'active'
  }
})

export class TabBodyComponent {

  @Input()
  public content: TemplateRef<any>;

  @Input()
  public get active(): boolean {
    return this._active;
  }
  public set active(value: boolean) {
    if (this._active !== value) {
      this._active = coerceBoolean(value);
    }
  }
  private _active: boolean;

  constructor() {
    this.active = false;
  }
}
