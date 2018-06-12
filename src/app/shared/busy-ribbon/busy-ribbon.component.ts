import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import {
  CoreDefinition,
  McsThemeType
} from '../../core';
import { animateFactory } from '../../utilities';

@Component({
  selector: 'mcs-busy-ribbon',
  templateUrl: './busy-ribbon.component.html',
  styleUrls: ['./busy-ribbon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [
    animateFactory.fadeIn,
    animateFactory.transformVertical
  ],
  host: {
    'class': 'busy-ribbon-wrapper',
    '[class.busy-ribbon-light]': 'theme === "light"',
    '[class.busy-ribbon-dark]': 'theme === "dark"',
    '[@transformVertical]': '"transform"'
  }
})

export class BusyRibbonComponent {
  @Input()
  public theme: McsThemeType = 'light';

  /**
   * Returns the spinner icon key
   */
  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }
}
