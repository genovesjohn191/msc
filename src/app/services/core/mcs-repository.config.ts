import { EventBusState } from '@app/event-bus';

export class McsRepositoryConfig<TEntity> {
  dataChangeEvent?: EventBusState<TEntity[]>;
  dataClearEvent?: EventBusState<void>;
}
