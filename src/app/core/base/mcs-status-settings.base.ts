import { ChangeDetectorRef } from '@angular/core';
import {
  isNullOrEmpty,
  McsStatusType,
  McsStatusColorType,
  CommonDefinition
} from '@app/utilities';

export abstract class McsStatusSettingsBase {

  /**
   * Returns the color type based on the status
   */
  public statusColor: McsStatusColorType = 'primary';

  /**
   * Returns the icon key based on the status
   */
  public statusIconKey: string = CommonDefinition.ASSETS_SVG_INFO;
  private _statusMapTable: Map<McsStatusType, string>;

  constructor(private _changeDetectorRef: ChangeDetectorRef) { }

  /**
   * Initializes the dialog settings
   */
  public initializeSettings(): void {
    this._createStatusMapTable();
    this._setColorByType(this.statusType);
    this._setDialogIconByType(this.statusType);
  }

  protected abstract get statusType(): McsStatusType;

  /**
   * Creates the status map table
   */
  private _createStatusMapTable(): void {
    this._statusMapTable = new Map();
    this._statusMapTable.set('success', CommonDefinition.ASSETS_FONT_CHECK_CIRCLE);
    this._statusMapTable.set('warning', CommonDefinition.ASSETS_SVG_WARNING);
    this._statusMapTable.set('error', CommonDefinition.ASSETS_SVG_ERROR);
    this._statusMapTable.set('info', CommonDefinition.ASSETS_SVG_INFO);
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
