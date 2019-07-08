import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  McsDisposable,
  unsubscribeSafely,
  isNullOrEmpty
} from '@app/utilities';
import { McsEvent } from '@app/event-manager';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsSystemMessage } from '@app/models';
import { McsSystemMessagesRepository } from '../repositories/mcs-system-messages.repository';
import { IMcsProcessable } from '../core/mcs-processable.interface';

@Injectable()
export class McsSystemMessageStateManager implements IMcsProcessable<McsSystemMessage>, McsDisposable {

  private _systemMessageCreateHandler: Subscription;

  constructor(
    private _eventDispatcher: EventBusDispatcherService,
    private _systemMessageRepository: McsSystemMessagesRepository
  ) {
    this._registerEvents();
  }

  /**
   * Disposes the state manager instance
   */
  public dispose(): void {
    unsubscribeSafely(this._systemMessageCreateHandler);
  }

  /**
   * Updates the entity state
   * @param entity Entity to be updated
   */
  public updateEntityState(entity: McsSystemMessage): void {
    if (isNullOrEmpty(entity)) { return; }
    entity.isProcessing = true;
    this._systemMessageRepository.addOrUpdate(entity);
  }

  /**
   * Clears the entity state
   * @param entity Entity to be cleared
   */
  public clearEntityState(entity: McsSystemMessage): void {
    if (isNullOrEmpty(entity)) { return; }
    entity.isProcessing = false;
    this._systemMessageRepository.addOrUpdate(entity);
  }

  /**
   * Refresh the system message listing repository data
   */
  private _refreshSystemMessageListing(): void {
    this._systemMessageRepository.clearData();
  }

  /**
   * Registers event bus states
   */
  private _registerEvents(): void {
    this._systemMessageCreateHandler = this._eventDispatcher.addEventListener(
      McsEvent.systemMessageCreated, this._refreshSystemMessageListing.bind(this));
  }

}
