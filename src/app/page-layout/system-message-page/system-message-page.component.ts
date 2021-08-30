import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { McsSystemMessage } from '@app/models';
import {
  getSafeProperty,
  CommonDefinition
} from '@app/utilities';
import {
  McsCookieService,
  CoreConfig
} from '@app/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'mcs-system-message-page',
  templateUrl: 'system-message-page.component.html',
  styleUrls: ['system-message-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'system-message-page-wrapper'
  }
})

export class SystemMessagePageComponent implements OnInit {

  public systemMessage$: Observable<McsSystemMessage>;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _cookieService: McsCookieService,
    private _coreConfig: CoreConfig,
    private _translate: TranslateService,
  ) { }

  public ngOnInit() {
    this._subscribeToSystemMessageResolve();
  }

  public get warningBlueIconKey(): string {
    return CommonDefinition.ASSETS_SVG_WARNING_BLUE;
  }

  public get macviewUrl(): string {
    return this._coreConfig.macviewUrl;
  }

  /**
   * Proceeds to Portal page and store cookie of messagesId
   * @param message Active message details
   */
  public proceedToPortal(message: McsSystemMessage): void {
    this._cookieService.setEncryptedItem<any>(CommonDefinition.COOKIE_ACTIVE_MESSAGE,
      message);
    location.reload();
  }

  /**
   * Redirects to Macquarie View
   */
  public goToMacquarieView(): void {
    window.open(this._coreConfig.macviewUrl);
  }

  public secondaryLabel(macquarieViewFallback: boolean): string {
    if (!macquarieViewFallback) {
      return this._translate.instant('systemMessagePage.secondaryAdvisoryLabelWithoutMacquarieView');
    }
    return this._translate.instant('systemMessagePage.secondaryAdvisoryLabelWithMacquarieView', { macViewUrl: this.macviewUrl });
  }

  /**
   * Subscribe to message edit resolver
   */
  private _subscribeToSystemMessageResolve(): void {
    this.systemMessage$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.message))
    );
  }

}
