import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Injector
} from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import {
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
import { CommonDefinition } from '@app/utilities';

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
    super(_injector, _changeDetectorRef, { dataChangeEvent: McsEvent.dataChangeSystemMessages });
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public get addIconKey(): string {
    return CommonDefinition.ASSETS_SVG_PLUS;
  }

  public get timeZone(): string {
    return CommonDefinition.TIMEZONE_SYDNEY;
  }

  /**
   * Returns the column settings key for the filter selector
   */
  protected get columnSettingsKey(): string {
    return CommonDefinition.FILTERSELECTOR_SYSTEM_MESSAGE_LISTING;
  }

  /**
   * This will navigate to system message creation page
   */
  public onClickNewMessage(): void {
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.SystemMessageCreate)]);
  }

  /**
   * Gets the entity listing based on the context
   * @param query Query to be obtained on the listing
   */
  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsSystemMessage>> {
    return this._apiService.getSystemMessages(query);
  }
}
