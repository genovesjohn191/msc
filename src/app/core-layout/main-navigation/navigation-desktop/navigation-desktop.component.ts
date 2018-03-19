import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
/** Providers / Services */
import {
  CoreDefinition,
  McsTextContentProvider
} from '../../../core';
import { resolveEnvVar } from '../../../utilities';

@Component({
  selector: 'mcs-navigation-desktop',
  templateUrl: './navigation-desktop.component.html',
  styleUrls: ['./navigation-desktop.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class NavigationDesktopComponent implements OnInit {

  public textContent: any;

  public get macquarieViewUrl(): string {
    return resolveEnvVar('MACQUARIE_VIEW_URL');
  }

  public get arrowUpIconKey(): string {
    return CoreDefinition.ASSETS_SVG_ARROW_UP_WHITE;
  }

  constructor(private _textContentProvider: McsTextContentProvider) {
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.navigation;
  }
}
