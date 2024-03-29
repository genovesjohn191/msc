import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Injector } from '@angular/core';
import {
  McsEntityBase,
  McsEntityRequester
} from '@app/models';
import {
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';

import { McsRepository } from '../../core/mcs-repository.interface';
import { IMcsEntityStateManager } from '../base/mcs-entity-state-manager.interface';

export abstract class McsEntityStateManagerBase<T extends McsEntityBase> implements IMcsEntityStateManager<T> {
  protected readonly entityRepository: McsRepository<T>;

  constructor(_injector: Injector, _repoInstance: new (...args: any[]) => McsRepository<T>) {
    this.entityRepository = _injector.get(_repoInstance);
  }

  /**
   * Gets the updated entity details
   * @param id Id of the entity to be obtained
   */
  public getUpdatedEntityDetails(id: string): Observable<T> {
    return this.entityRepository.getById(id);
  }

  /**
   * Updated the entity state by requester
   * @param requester Requester of the entity to be updated
   */
  public updateEntityState(requester: McsEntityRequester): void {
    let entityId = getSafeProperty(requester, (obj) => obj.id);
    if (isNullOrEmpty(entityId)) { return; }

    this.entityRepository.getBy((item) => item.id === entityId).pipe(
      tap((entity) => {
        if (isNullOrEmpty(entity)) { return; }

        entity.isProcessing = true;
        entity.isDisabled = requester.disabled;
        entity.processingText = requester.message;
      })
    ).subscribe();
  }

  /**
   * Clears the entity state by requester
   * @param requester Requester of the entity to be cleared
   */
  public clearEntityState(requester: McsEntityRequester): void {
    let entityId = getSafeProperty(requester, (obj) => obj.id);
    if (isNullOrEmpty(entityId)) { return; }

    this.entityRepository.getBy((item) => item.id === entityId).pipe(
      tap((entity) => {
        if (isNullOrEmpty(entity)) { return; }

        entity.isProcessing = false;
        entity.isDisabled = false;
        entity.processingText = null;
      })
    ).subscribe();
  }

  /**
   * Sorts the entity records based on inherited class sorting method
   */
  public sortEntityRecords(): void {
    // This should be overrided in every child class
  }

  /**
   * Refreshes the data cache
   */
  public refreshDataCache(): void {
    // By clearing the data from the repository, the dataClear event of the corresponding
    // entity will be dispatched accordingly in which the subscriber of that event will
    // automatically call the corresponding action in order to generate new data from the table,
    // based on default pagination (if any).
    this.entityRepository.clearData();
  }
}
