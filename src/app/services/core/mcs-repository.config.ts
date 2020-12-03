import { EventBusState } from '@peerlancers/ngx-event-bus';

export class McsRepositoryConfig<TEntity> {
  dataChangeEvent?: EventBusState<TEntity[]>;
  dataClearEvent?: EventBusState<void>;
}
