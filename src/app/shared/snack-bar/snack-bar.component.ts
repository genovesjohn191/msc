import {
  Component,
  Input,
  Optional,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  CoreDefinition,
  McsSnackBarRef,
  McsThemeType
} from '../../core';
import { coerceBoolean } from '../../utilities';

@Component({
  selector: 'mcs-snack-bar',
  templateUrl: './snack-bar.component.html',
  styleUrls: ['./snack-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'snack-bar-wrapper',
    '[class.snack-bar-dark]': 'theme === "dark"',
    '[class.snack-light-dark]': 'theme === "light"'
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
  public get snackBarRef(): McsSnackBarRef<any> { return this._snackBarRef; }
  public set snackBarRef(value: McsSnackBarRef<any>) { this._snackBarRef = value; }

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
      CoreDefinition.ASSETS_SVG_CLOSE_WHITE :
      CoreDefinition.ASSETS_SVG_CLOSE_BLACK;
  }

  public get rippleColor(): string {
    return this.theme === 'dark' ? 'light' : 'dark';
  }

  constructor(@Optional() private _snackBarRef: McsSnackBarRef<any>) { }
}
