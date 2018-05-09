import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
/** Providers / Services */
import {
  CoreDefinition,
  McsTextContentProvider,
  McsAccessControlService
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

  public get arrowUpIconKey(): string {
    return CoreDefinition.ASSETS_SVG_ARROW_UP_WHITE;
  }

  public get caretDownIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_DOWN;
  }

  constructor(
    private _router: Router,
    private _textContentProvider: McsTextContentProvider,
    private _accessControlService: McsAccessControlService
  ) {
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.navigation;
  }

  /**
   * Navigate to product catalog
   * @param product Product to be navigated
   */
  public gotoProduct(_product: any) {
    // TODO: Id was set temporarily, this should be a mega-menu
    // so that the user can choose the product
    this._router.navigate(['/products/', '01147ad4-5a46-4af5-855b-9c09a64bb768']);
  }

  /**
   * Returns the macquarie view url
   */
  public get macquarieViewUrl(): string {
    return resolveEnvVar('MACQUARIE_VIEW_URL');
  }

  /**
   * Returns true when feature flag is on for product catalog
   */
  public get productCatalogFeatureIsOn(): boolean {
    return this._accessControlService.hasAccessToFeature('enableProductCatalog');
  }
}
