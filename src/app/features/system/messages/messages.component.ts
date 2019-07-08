import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Injector
} from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import {
  CoreDefinition,
  McsTableListingBase,
  CoreRoutes
} from '@app/core';
import {
  RouteKey,
  McsSystemMessage,
  McsQueryParam,
  McsApiCollection
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsEvent } from '@app/event-manager';

@Component({
  selector: 'mcs-system-messages',
  templateUrl: './messages.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})

export class SystemMessagesComponent extends McsTableListingBase<McsSystemMessage> {

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
    private _router: Router
  ) {
    super(_injector, _changeDetectorRef, McsEvent.dataChangeSystemMessages);
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public get addIconKey(): string {
    return CoreDefinition.ASSETS_FONT_PLUS;
  }

  /**
   * This will navigate to system message creation page
   */
  public onClickNewMessage(): void {
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.SystemMessageCreate)]);
  }

  /**
   * Returns the column settings key for the filter selector
   */
  protected get columnSettingsKey(): string {
    return CoreDefinition.FILTERSELECTOR_SYSTEM_MESSAGE_LISTING;
  }

  /**
   * Gets the entity listing based on the context
   * @param query Query to be obtained on the listing
   */
  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsSystemMessage>> {
    return this._apiService.getSystemMessages(query);
  }
}
