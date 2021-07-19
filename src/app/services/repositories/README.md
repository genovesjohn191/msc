#### Adding an entity to the Data Repository

1. Create a your model in `src/app/models` and use `McsEntityBase` as the base class.
<br/>

        import { McsEntityBase } from '../common/mcs-entity.base';

        export class McsModelSample extends McsEntityBase {

            // ... properties here

        }

1. Create data context in `src/app/services/data-context`. Implement the `McsDataContext` interface and write the implementation for `getAllRecords()`, `getRecordById()`, and `filterRecords()`. 
<br/>

        import { McsDataContext } from '../core/mcs-data-context.interface';
        
        export class McsSampleDataContext implements McsDataContext<McsModelSample> {
            
            // .. implementation here
        
        }

1. Create entity factory in `src/app/api-client/factory` using `McsApiEntityFactory` as the base class.
<br/>

        import { McsApiEntityFactory } from './mcs-api-entity.factory';
        import { IMcsApiSampleService } from '../interfaces/mcs-api-sample.interface';
        import { McsApiSampleService } from '../services/mcs-api-sample.service';

        export class McsApiSampleFactory extends McsApiEntityFactory<IMcsApiSampleService> {
        constructor() {
                super(McsApiSampleService);
            }
        }


1. Create repository in `src/app/services/repositories`. Use `McsRepositoryBase` as the base class. 
<br/>

        @Injectable()
        export class McsSampleRepository extends McsRepositoryBase<McsModelSample> {

        constructor(
            _apiClientFactory: McsApiClientFactory,
            _eventDispatcher: EventBusDispatcherService
        ) {
            super(
            new McsSampleDataContext (
                _apiClientFactory.getService(new McsApiSampleFactory())
            ),
            _eventDispatcher,
                {
                    dataChangeEvent: McsEvent.dataChangeSampleEvent
                }
            );
            }
        }   
