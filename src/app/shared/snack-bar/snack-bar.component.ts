import {
  Component,
  Input,
  Optional,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  coerceBoolean,
  McsThemeType,
  CommonDefinition
} from '@app/utilities';
import { SnackBarRef } from './snack-bar-ref/snack-bar-ref';

@Component({
  selector: 'mcs-snack-bar',
  templateUrl: './snack-bar.component.html',
  styleUrls: ['./snack-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'snack-bar-wrapper'
  }
})

export class SnackBarComponent {
  @Input()
  public theme: McsThemeType = 'light';

  /**
   * The snack bar result to be attached when the snack bar is closed
   */
  @Input()
  public snackBarResult: any;

  /**
   * Reference of the snack bar instance since the snackBarRef injector is null
   * when the binding for the snack bar is template
   */
  @Input()
  public get snackBarRef(): SnackBarRef<any> { return this._snackBarRef; }
  public set snackBarRef(value: SnackBarRef<any>) { this._snackBarRef = value; }

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
    return this.theme === 'dark' ?
      CommonDefinition.ASSETS_SVG_CLOSE_WHITE :
      CommonDefinition.ASSETS_SVG_CLOSE_BLACK;
  }

  public get rippleColor(): string {
    return this.theme === 'dark' ? 'light' : 'dark';
  }

  constructor(@Optional() private _snackBarRef: SnackBarRef<any>) { }
}
