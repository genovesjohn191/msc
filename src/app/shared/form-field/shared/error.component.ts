import {
  Component,
  Input,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { McsUniqueId } from '@app/core';

@Component({
  selector: 'mcs-error',
  template: `
    <ng-content></ng-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'error-wrapper',
    'role': 'alert',
    '[attr.id]': 'id',
    '[class.hide-element]': '!visible'
  }
})

export class ErrorComponent {
  @Input()
  public id: string = McsUniqueId.NewId('error-item');

  @Input()
  public errorState: string;

  /**
   * Determine whether the error message is displayed or not
   */
  private _visible: boolean;
  public get visible(): boolean {
    return this._visible;
  }
  public set visible(value: boolean) {
    if (this._visible !== value) {
      this._visible = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  constructor(private _changeDetectorRef: ChangeDetectorRef) { }

  /**
   * Show the error message corresponds with this state
   */
  public show(): void {
    this.visible = true;
  }

  /**
   * Hide the error message corresponds with this state
   */
  public hide(): void {
    this.visible = false;
  }
}
