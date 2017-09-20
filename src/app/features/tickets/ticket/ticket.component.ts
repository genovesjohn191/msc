import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import { Observable } from 'rxjs/Rx';
import {
  isNullOrEmpty,
  getEnumString,
  convertDateToStandardString,
  compareDates
} from '../../../utilities';
import {
  Ticket,
  TicketStatus,
  TicketSubType,
  TicketAttachment,
  TicketComment,
  TicketActivity,
  TicketActivityType
} from '../models';
import { TicketsService } from '../tickets.service';

@Component({
  selector: 'mcs-ticket',
  templateUrl: './ticket.component.html',
  styles: [require('./ticket.component.scss')]
})

export class TicketComponent implements OnInit, OnDestroy {

  /**
   * An observable ticket data that obtained based on the given id
   */
  private _ticket: Ticket;
  public get ticket(): Ticket {
    return this._ticket;
  }
  public set ticket(value: Ticket) {
    if (this._ticket !== value) {
      this._ticket = value;
      this._setActivities(this._ticket);
    }
  }

  /**
   * List of activities of the ticket
   */
  private _activities: TicketActivity[];
  public get activities(): TicketActivity[] {
    return this._activities;
  }
  public set activities(value: TicketActivity[]) {
    this._activities = value;
  }

  private _ticketSubscription: any;

  public constructor(
    private _activatedRoute: ActivatedRoute,
    private _ticketsService: TicketsService
  ) {
    this._ticket = new Ticket();
    this._activities = new Array();
  }

  public ngOnInit() {
    // Get ticket data by ID
    this._getTicketById();
  }

  public ngOnDestroy() {
    if (this._ticketSubscription) {
      this._ticketSubscription.unsubscribe();
    }
  }

  /**
   * Return the status string based on enumeration type
   * @param status Enumeration status to be converted
   */
  public getStateString(status: TicketStatus) {
    return getEnumString(TicketStatus, status);
  }

  /**
   * Return the subtype string based on enumeration type
   * @param status Enumeration status to be converted
   */
  public getSubTypeString(status: TicketSubType) {
    return getEnumString(TicketSubType, status);
  }

  /**
   * Converts the date and time to string based on standard format
   * @param date Date to be converted
   */
  public convertDateToString(date: Date) {
    return convertDateToStandardString(date);
  }

  /**
   * Get Ticket based on the given ID in the provided parameter
   */
  private _getTicketById(): void {
    // TODO: Add error handling in case the ticket ID is incorrect
    // Should display the page-not-found
    this._ticketSubscription = this._activatedRoute.paramMap
      .switchMap((params: ParamMap) => {
        let ticketId = params.get('id');
        return this._ticketsService.getTicket(ticketId);
      })
      .subscribe((response) => {
        if (!isNullOrEmpty(response)) {
          this.ticket = response.content;
        }
      });
  }

  /**
   * Set the activities of the ticket and sort it by created date
   * @param ticket Ticket to get the comments/attachment from
   */
  private _setActivities(ticket: Ticket): void {
    if (isNullOrEmpty(ticket)) { return; }
    let ticketActivities: TicketActivity[] = new Array();

    // Add attachment to the activity list
    this.ticket.attachments.forEach((ticketAttachment) => {
      let activity = new TicketActivity();

      activity.header = ticketAttachment.createdBy;
      activity.content = ticketAttachment.fileName;
      activity.date = ticketAttachment.createdOn;
      activity.type = TicketActivityType.Attachment;
      ticketActivities.push(activity);
    });

    // Add comments to the activity list
    this.ticket.comments.forEach((ticketItem) => {
      let activity = new TicketActivity();

      activity.header = ticketItem.name;
      activity.content = ticketItem.value;
      activity.date = ticketItem.createdOn;
      activity.type = TicketActivityType.Comment;
      ticketActivities.push(activity);
    });

    // Sort activities by date
    ticketActivities.sort((_first: TicketActivity, _second: TicketActivity) => {
      return compareDates(_second.date, _first.date);
    });
    this.activities = ticketActivities;
  }
}
