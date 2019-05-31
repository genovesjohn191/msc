import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  McsDisposable,
  unsubscribeSafely,
  isNullOrEmpty
} from '@app/utilities';
import { McsEvent } from '@app/event-manager';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsOrder } from '@app/models';
import { McsOrdersRepository } from '@app/services';
import { IMcsInitializable } from '../interfaces/mcs-initializable.interface';
import { IMcsProcessable } from '../interfaces/mcs-processable.interface';

@Injectable()
export class McsOrderStateManager implements IMcsInitializable, IMcsProcessable<McsOrder>, McsDisposable {

  private _orderEndedHandler: Subscription;
  private _orderInProgressHandler: Subscription;

  constructor(
    private _eventDispatcher: EventBusDispatcherService,
    private _ordersRepository: McsOrdersRepository
  ) { }

  /**
   * Initializes class properties / variables
   */
  public initialize(): void {
    this._registerEvents();
  }

  /**
   * Disposes the state manager instance
   */
  public dispose(): void {
    unsubscribeSafely(this._orderEndedHandler);
    unsubscribeSafely(this._orderInProgressHandler);
  }

  /**
   * Updates the entity state
   * @param entity Entity to be updated
   */
  public updateEntityState(entity: McsOrder): void {
    if (isNullOrEmpty(entity)) { return; }
    entity.isProcessing = true;
    this._ordersRepository.addOrUpdate(entity);
  }

  /**
   * Clears the entity state
   * @param entity Entity to be cleared
   */
  public clearEntityState(entity: McsOrder): void {
    if (isNullOrEmpty(entity)) { return; }
    entity.isProcessing = false;
    this._ordersRepository.addOrUpdate(entity);
  }

  /**
   * Registers event bus states
   */
  private _registerEvents(): void {
    this._orderInProgressHandler = this._eventDispatcher.addEventListener(
      McsEvent.orderStateBusy, this._onStateBusy.bind(this));

    this._orderEndedHandler = this._eventDispatcher.addEventListener(
      McsEvent.orderStateEnded, this._onStateEnded.bind(this));
  }

  /**
   * Event that emits when entity state is busy
   * @param orderId Order id to set the state
   */
  private _onStateBusy(orderId: string): void {
    this._ordersRepository.getBy((order) => order.id === orderId)
      .subscribe(this.updateEntityState.bind(this));
  }

  /**
   * Event that emits when the entity state is ended
   * @param orderId Order id to clear the state
   */
  private _onStateEnded(orderId: string): void {
    this._ordersRepository.getBy((order) => order.id === orderId)
      .subscribe(this.clearEntityState.bind(this));
  }
}
