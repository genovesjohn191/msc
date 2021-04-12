import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

import {
  Injectable,
  Injector
} from '@angular/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  EntityRequester,
  McsEntityRequester
} from '@app/models';
import {
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  McsDisposable
} from '@app/utilities';

import { IMcsEntityStateManager } from './base/mcs-entity-state-manager.interface';
import { McsBackupAggregationTargetStateManager } from './entities/mcs-backup-aggregation-target.state-manager';
import { McsMediaStateManager } from './entities/mcs-media.state-manager';
import { McsOrderStateManager } from './entities/mcs-order.state-manager';
import { McsServerStateManager } from './entities/mcs-server.state-manager';
import { McsSystemMessageStateManager } from './entities/mcs-system-message.state-manager';
import { McsTicketStateManager } from './entities/mcs-ticket.state-manager';

@Injectable()
export class McsStateManagerClient implements McsDisposable {
  private _entityFactoryTable: Map<EntityRequester, IMcsEntityStateManager<any>>;

  private _entityUpdateHandler: Subscription;
  private _entityClearStateHandler: Subscription;
  private _entityUpdatedHandler: Subscription;
  private _entityCreatedHandler: Subscription;
  private _entityDeletedHandler: Subscription;

  constructor(
    private _eventDispatcher: EventBusDispatcherService,
    private _injector: Injector
  ) {
    this._entityFactoryTable = new Map();
    this._registerEntityFactory();
    this._registerEventHandlers();
  }

  /**
   * Disposes all the resources of the entity client
   */
  public dispose(): void {
    unsubscribeSafely(this._entityUpdateHandler);
    unsubscribeSafely(this._entityClearStateHandler);
    unsubscribeSafely(this._entityUpdatedHandler);
    unsubscribeSafely(this._entityCreatedHandler);
    unsubscribeSafely(this._entityDeletedHandler);
  }

  /**
   * Gets the entity factory of the specified entity instance
   * @param entity Entity instance to get the factory
   */
  private _getEntityFactory(entityRequester: EntityRequester): IMcsEntityStateManager<any> {
    if (isNullOrEmpty(entityRequester)) { return null; }

    let factoryFound = this._entityFactoryTable.get(entityRequester);
    if (isNullOrEmpty(factoryFound)) { return null; }
    return factoryFound;
  }

  /**
   * Event that emits when an entity has been active
   * @param payload Payload of the active entity
   */
  private _onEntityActive(payload: McsEntityRequester): void {
    let entityFactory = this._getEntityFactory(getSafeProperty(payload, (obj) => obj.type));
    if (isNullOrEmpty(entityFactory)) { return; }
    entityFactory.updateEntityState(payload);
  }

  /**
   * Event that emits when an entity state has been cleared
   * @param payload Payload to the entity to be clear
   */
  private _onEntityClearState(payload: McsEntityRequester): void {
    let entityFactory = this._getEntityFactory(getSafeProperty(payload, (obj) => obj.type));
    if (isNullOrEmpty(entityFactory)) { return; }
    entityFactory.clearEntityState(payload);
  }

  /**
   * Event that emits when an entity has been updated
   * @param payload Payload of the updated entity
   */
  private _onEntityUpdated(payload: McsEntityRequester): void {
    let entityFactory = this._getEntityFactory(getSafeProperty(payload, (obj) => obj.type));
    if (isNullOrEmpty(entityFactory)) { return; }

    entityFactory.getUpdatedEntityDetails(payload.id).pipe(
      tap(() => {
        entityFactory.clearEntityState(payload);
        entityFactory.sortEntityRecords();
      })
    ).subscribe();
  }

  /**
   * Event that emits when an entity has been created
   * @param payload Payload of the created entity
   */
  private _onEntityCreated(payload: McsEntityRequester): void {
    let entityFactory = this._getEntityFactory(getSafeProperty(payload, (obj) => obj.type));
    if (isNullOrEmpty(entityFactory)) { return; }

    entityFactory.refreshDataCache();
  }

  /**
   * Event that emits when an entity has been deleted
   * @param payload Payload of the deleted entity
   */
  private _onEntityDeleted(payload: McsEntityRequester): void {
    let entityFactory = this._getEntityFactory(getSafeProperty(payload, (obj) => obj.type));
    if (isNullOrEmpty(entityFactory)) { return; }

    entityFactory.refreshDataCache();
  }

  /**
   * Registers all the associated event handlers for the entity client
   */
  private _registerEventHandlers(): void {
    this._entityUpdateHandler = this._eventDispatcher.addEventListener(
      McsEvent.entityActiveEvent, this._onEntityActive.bind(this));

    this._entityClearStateHandler = this._eventDispatcher.addEventListener(
      McsEvent.entityClearStateEvent, this._onEntityClearState.bind(this));

    this._entityUpdatedHandler = this._eventDispatcher.addEventListener(
      McsEvent.entityUpdatedEvent, this._onEntityUpdated.bind(this));

    this._entityCreatedHandler = this._eventDispatcher.addEventListener(
      McsEvent.entityCreatedEvent, this._onEntityCreated.bind(this));

    this._entityDeletedHandler = this._eventDispatcher.addEventListener(
      McsEvent.entityDeletedEvent, this._onEntityDeleted.bind(this));
  }

  /**
   * Registers the entity factories
   */
  private _registerEntityFactory(): void {
    this._entityFactoryTable.set(EntityRequester.Order, new McsOrderStateManager(this._injector));
    this._entityFactoryTable.set(EntityRequester.Server, new McsServerStateManager(this._injector));
    this._entityFactoryTable.set(EntityRequester.Media, new McsMediaStateManager(this._injector));
    this._entityFactoryTable.set(EntityRequester.Ticket, new McsTicketStateManager(this._injector));
    this._entityFactoryTable.set(EntityRequester.SystemMessage, new McsSystemMessageStateManager(this._injector));
    this._entityFactoryTable.set(EntityRequester.BackupAggregationTarget, new McsBackupAggregationTargetStateManager(this._injector));
  }
}
