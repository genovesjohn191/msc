import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Injector
} from '@angular/core';
import { Observable } from 'rxjs';
import {
  CoreDefinition,
  McsTableListingBase,
  McsAuthenticationIdentity,
  McsNavigationService
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
import { EventBusPropertyListenOn } from '@peerlancers/ngx-event-bus';
import { McsEvent } from '@app/events';

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
    private _navigationService: McsNavigationService,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _apiService: McsApiService
  ) {
    super(_injector, _changeDetectorRef, { dataChangeEvent: McsEvent.dataChangeJobs });
  }

  public get activeCompany(): McsCompany {
    return this._authenticationIdentity.activeAccount;
  }

  /**
   * Navigates to notification page
   * @param job Notification job on where to go
   */
  public navigateToNotification(job: McsJob): void {
    if (isNullOrEmpty(job)) { return; }
    this._navigationService.navigateTo(RouteKey.Notification, [job.id]);
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
