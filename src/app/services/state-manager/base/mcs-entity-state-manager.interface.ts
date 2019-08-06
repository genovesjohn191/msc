import { Observable } from 'rxjs';
import {
  McsEntityBase,
  McsEntityRequester
} from '@app/models';
import { IMcsEntitySortable } from './mcs-entity-sortable.interface';

export interface IMcsEntityStateManager<T extends McsEntityBase> extends IMcsEntitySortable {
  getUpdatedEntityDetails(id: string): Observable<T>;
  updateEntityState(entity: McsEntityRequester): void;
  clearEntityState(entity: McsEntityRequester): void;
  refreshDataCache(): void;
}
