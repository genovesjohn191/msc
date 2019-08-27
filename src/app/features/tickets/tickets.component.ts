import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Injector
} from '@angular/core';
import { Observable } from 'rxjs';
import {
  McsTableListingBase,
  McsNavigationService
} from '@app/core';
import {
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';
import {
  RouteKey,
  McsTicket,
  McsQueryParam,
  McsApiCollection
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsEvent } from '@app/events';

@Component({
  selector: 'mcs-tickets',
  templateUrl: './tickets.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})

export class TicketsComponent extends McsTableListingBase<McsTicket> {

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
    private _navigationService: McsNavigationService
  ) {
    super(_injector, _changeDetectorRef, { dataChangeEvent: McsEvent.dataChangeTickets });
  }

  public get addIconKey(): string {
    return CommonDefinition.ASSETS_SVG_PLUS;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  /**
   * Navigate to ticket details page
   * @param ticket Ticket to view the details
   */
  public navigateToTicket(ticket: McsTicket): void {
    if (isNullOrEmpty(ticket)) { return; }
    this._navigationService.navigateTo(RouteKey.TicketDetails, [ticket.id]);
  }

  /**
   * This will navigate to ticket creation page
   */
  public onClickNewTicket(): void {
    this._navigationService.navigateTo(RouteKey.TicketCreate);
  }

  /**
   * Returns the column settings key for the filter selector
   */
  protected get columnSettingsKey(): string {
    return CommonDefinition.FILTERSELECTOR_TICKET_LISTING;
  }

  /**
   * Gets the entity listing based on the context
   * @param query Query to be obtained on the listing
   */
  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsTicket>> {
    return this._apiService.getTickets(query);
  }
}
