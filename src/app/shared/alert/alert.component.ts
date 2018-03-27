import {
  Component,
  Input,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import {
  CoreDefinition,
  McsStatusType,
  McsColorType
} from '../../core';

@Component({
  selector: 'mcs-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClass'
  }
})

export class AlertComponent {
  @Input()
  public header: string;

  @Input()
  public get type(): McsStatusType { return this._type; }
  public set type(value: McsStatusType) {
    if (value !== this._type) {
      this._type = value;
      this._changeDetectorRef.markForCheck();
    }
  }
  private _type: McsStatusType = 'success';

  /**
   * Returns the host class based on its type
   */
  public get hostClass(): string {
    return `${this._type} alert-wrapper`;
  }

  constructor(private _changeDetectorRef: ChangeDetectorRef) { }

  /**
   * Returns the alert icon key and color based on status
   */
  public get alertIconDetails(): { key, color } {
    let iconKey: string;
    let iconColor: McsColorType;

    switch (this.type) {
      case 'failed':
        iconKey = CoreDefinition.ASSETS_FONT_CLOSE_CIRCLE;
        iconColor = 'red';
        break;
      case 'warning':
        iconKey = CoreDefinition.ASSETS_FONT_WARNING;
        iconColor = 'red';
        break;
      case 'info':
        iconKey = CoreDefinition.ASSETS_FONT_INFORMATION_CIRCLE;
        iconColor = 'primary';
        break;
      case 'success':
      default:
        iconKey = CoreDefinition.ASSETS_FONT_CHECK_CIRCLE;
        iconColor = 'green';
        break;
    }
    return { key: iconKey, color: iconColor };
  }
}
