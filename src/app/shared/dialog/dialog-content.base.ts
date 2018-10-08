import { ChangeDetectorRef } from '@angular/core';
import { CoreDefinition } from '@app/core';
import {
  isNullOrEmpty,
  McsStatusType,
  McsStatusColorType
} from '@app/utilities';

export abstract class DialogContentBase {

  public statusColor: McsStatusColorType = 'primary';
  public statusIconKey: string = CoreDefinition.ASSETS_SVG_INFO;
  private _statusMapTable: Map<McsStatusType, string>;

  constructor(private _changeDetectorRef: ChangeDetectorRef) { }

  /**
   * Initializes the dialog settings
   */
  public initializeDialog(): void {
    this._createStatusMapTable();
    this._setColorByType(this.dialogType);
    this._setDialogIconByType(this.dialogType);
  }

  protected abstract get dialogType(): McsStatusType;

  /**
   * Creates the status map table
   */
  private _createStatusMapTable(): void {
    this._statusMapTable = new Map();
    this._statusMapTable.set('success', CoreDefinition.ASSETS_FONT_CHECK_CIRCLE);
    this._statusMapTable.set('warning', CoreDefinition.ASSETS_SVG_WARNING);
    this._statusMapTable.set('error', CoreDefinition.ASSETS_SVG_ERROR);
    this._statusMapTable.set('info', CoreDefinition.ASSETS_SVG_INFO);
  }

  /**
   * Sets the dialog icon based on its type
   */
  private _setDialogIconByType(type: McsStatusType): void {
    if (isNullOrEmpty(type)) { return; }
    this.statusIconKey = this._statusMapTable.get(type);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Sets the color of the button by type
   * @param type Type to be the basis of color
   */
  private _setColorByType(type: McsStatusType): void {
    let dangerType = type === 'error' || type === 'warning';
    this.statusColor = dangerType ? 'error' : 'primary';
    this._changeDetectorRef.markForCheck();
  }
}
