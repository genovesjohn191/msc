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
  @Input()
  public dialogResult: any;

  public get closeIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CLOSE_BLACK;
  }

  constructor( @Optional() public dialogRef: McsDialogRef<any>) { }
}
