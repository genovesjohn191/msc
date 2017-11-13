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
} from '../../../core';

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

  public get closeIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CLOSE_BLACK;
  }

  constructor( @Optional() public dialogRef: McsDialogRef<any>) { }
}
