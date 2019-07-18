import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  McsDisposable,
  unsubscribeSafely,
  isNullOrEmpty
} from '@app/utilities';
import { McsTicket } from '@app/models';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/event-manager';
import { IMcsProcessable } from '../core/mcs-processable.interface';
import { McsTicketsRepository } from '../repositories/mcs-tickets.repository';

@Injectable()
export class McsTicketStateManager implements IMcsProcessable<McsTicket>, McsDisposable {

  private _ticketCreateHandler: Subscription;

  constructor(
    private _eventDispatcher: EventBusDispatcherService,
    private _ticketRepository: McsTicketsRepository
  ) {
    this._registerEvents();
  }

  /**
   * Disposes the state manager instance
   */
  public dispose(): void {
    unsubscribeSafely(this._ticketCreateHandler);
  }

  /**
   * Updates the entity state
   * @param entity Entity to be updated
   */
  public updateEntityState(entity: McsTicket): void {
    if (isNullOrEmpty(entity)) { return; }
    entity.isProcessing = true;
    this._ticketRepository.addOrUpdate(entity);
  }

  /**
   * Clears the entity state
   * @param entity Entity to be cleared
   */
  public clearEntityState(entity: McsTicket): void {
    if (isNullOrEmpty(entity)) { return; }
    entity.isProcessing = false;
    this._ticketRepository.addOrUpdate(entity);
  }

  /**
   * Refresh the ticket repository data
   */
  private _refreshTicketListing(): void {
    this._ticketRepository.clearData();
  }

  /**
   * Registers event bus states
   */
  private _registerEvents(): void {
    this._ticketCreateHandler = this._eventDispatcher.addEventListener(
      McsEvent.ticketCreateEvent, this._refreshTicketListing.bind(this));
  }
}
