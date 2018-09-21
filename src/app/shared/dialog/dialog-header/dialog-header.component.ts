import {
  Component,
  Input,
  Optional,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  CoreDefinition,
  McsDialogRef
} from '@app/core';
import { coerceBoolean } from '@app/utilities';

@Component({
  selector: 'mcs-dialog-header',
  templateUrl: './dialog-header.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'dialog-header-wrapper'
  }
})

export class DialogHeaderComponent {
  /**
   * The dialog result to be attached when the dialog is closed
   */
  @Input()
  public dialogResult: any;

  /**
   * Template of the dialog reference since the dialogref injector is null
   * when the binding for the dialog is template
   */
  @Input()
  public set dialogRefTemplate(value: McsDialogRef<any>) {
    this.dialogRef = value;
  }

  /**
   * Returns true when the close button is hidden
   */
  @Input()
  public get hideCloseButton(): boolean { return this._hideCloseButton; }
  public set hideCloseButton(value: boolean) {
    if (this._hideCloseButton !== value) {
      this._hideCloseButton = coerceBoolean(value);
    }
  }
  private _hideCloseButton: boolean = false;

  public get closeIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CLOSE_BLACK;
  }

  constructor(@Optional() public dialogRef: McsDialogRef<any>) { }
}
