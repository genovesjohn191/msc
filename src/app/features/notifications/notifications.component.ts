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
  CoreRoutes,
  McsTableListingBase,
  McsAuthenticationIdentity
} from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import { McsApiService } from '@app/services';
import {
  McsCompany,
  McsJob,
  RouteKey,
  McsQueryParam,
  McsApiCollection
} from '@app/models';
import { EventBusPropertyListenOn } from '@app/event-bus';
import { McsEvent } from '@app/event-manager';

@Component({
  selector: 'mcs-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NotificationsComponent extends McsTableListingBase<McsJob> {

  @EventBusPropertyListenOn(McsEvent.accountChange)
  public activeCompany$: Observable<McsCompany>;

  public constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _router: Router,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _apiService: McsApiService
  ) {
    super(_injector, _changeDetectorRef, McsEvent.dataChangeJobs);
  }

  public get activeCompany(): McsCompany {
    return this._authenticationIdentity.activeAccount;
  }

  /**
   * This will navigate to specified link, otherwise do nothing
   * @param url Url to be navigated
   */
  public tryNavigateTo(url: string): void {
    if (isNullOrEmpty(url)) { return; }
    this._router.navigate([url]);
  }

  /**
   * Navigates to notification page
   * @param job Notification job on where to go
   */
  public navigateToNotification(job: McsJob): void {
    if (isNullOrEmpty(job)) { return; }
    this._router.navigate([
      CoreRoutes.getNavigationPath(RouteKey.Notification),
      job.id
    ]);
  }

  /**
   * Returns the column settings key for the filter selector
   */
  protected get columnSettingsKey(): string {
    return CoreDefinition.FILTERSELECTOR_NOTIFICATIONS_LISTING;
  }

  /**
   * Gets the entity listing based on the context
   * @param query Query to be obtained on the listing
   */
  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsJob>> {
    return this._apiService.getJobs(query);
  }
}
