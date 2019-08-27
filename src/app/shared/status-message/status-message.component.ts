import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input
} from '@angular/core';
import {
  McsStatusType,
  CommonDefinition
} from '@app/utilities';

@Component({
  selector: 'mcs-status-message',
  templateUrl: './status-message.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'status-message-wrapper'
  }
})

export class StatusMessageComponent {
  @Input()
  public type: McsStatusType = 'info';

  private _statusIconMap = new Map<McsStatusType, string>();

  constructor() {
    this._createStatusIconMap();
  }

  /**
   * Returns the status icon key based on type
   */
  public get statusIconKey(): string {
    return this._statusIconMap.get(this.type);
  }

  /**
   * Creates the status icon map table
   */
  private _createStatusIconMap(): void {
    this._statusIconMap.set('info', CommonDefinition.ASSETS_SVG_INFO);
    this._statusIconMap.set('warning', CommonDefinition.ASSETS_SVG_WARNING);
    this._statusIconMap.set('success', CommonDefinition.ASSETS_SVG_SUCCESS);
    this._statusIconMap.set('error', CommonDefinition.ASSETS_SVG_ERROR);
  }
}
