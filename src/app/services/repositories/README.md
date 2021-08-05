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
            
            /**
            * Get all records from the api service
            */
            public getAllRecords(): Observable<McsModelSample[]> {
                return this._sampleService.getRecords().pipe(
                map((response) => this._getApiContentResponse(response))
                );
            }

            /**
            * Get record by entity id
            * @param id Entity id to get the record from
            */
            public getRecordById(id: string): Observable<McsModelSample> {
                return this._sampleService.getRecord(id).pipe(
                map((response) => this._getApiContentResponse(response))
                );
            }

            /**
            * Filters the records based on the query provided
            * @param query Query to be sent to API to query the data
            */
            public filterRecords(query: McsQueryParam): Observable<McsModelSample[]> {
                return this._sampleService.getRecords(query).pipe(
                map((response) => this._getApiContentResponse(response))
                );
            }

            /**
            * Returns the API Content response on the map
            * @param apiResponse Api response from where the content will be obtained
            */
            private _getApiContentResponse<T>(apiResponse: McsApiSuccessResponse<T>): T {
                if (isNullOrEmpty(apiResponse)) { return; }

                this.totalRecordsCount = apiResponse.totalCount;
                return apiResponse.content;
            }
        
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



1. Create a datachange event in `src/app/events/items` and add it to the McsEvent class (`src/app/events/mcs-event.ts`).
<br/>
        import { EventBusState } from '@app/event-bus';
        import { McsModelSample } from '@app/models';

        export class DataChangeSampleEvent extends EventBusState<McsModelSample[]> {
        constructor() {
            super('DataChangeSampleEvent');
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


#### Implementation

Using entity in McsApiService 

1. Declare your repository in McsApiService (`src/app/services/mcs-api.service.ts`)

        export class McsApiService {

            private readonly _sampleRepository: McsSampleRepository;
            ...

            constructor(_injector: Injector) {
                this._sampleRepository = _injector.get(McsSampleRepository);
            }
        }

1. McsApiService has methods you may use to map the entity records based on the repository you provide. 
<br>

    `_mapToEntityRecords()`
     Used to get a list of records, returns an observable collection

        public getSampleRecords(query?: McsSampleQueryParams):      
         Observable<McsApiCollection<McsModelSample>> {
            return this._mapToEntityRecords(this._sampleRepository, query).pipe(
            catchError((error) =>
                this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getSampleRecords'))
            )
            );
        }

    `_mapToEntityRecord()`
     Used to get a single record's details, returns an observable

        public getSampleRecord(id: string): Observable<McsModelSample> {
            return this._mapToEntityRecord(this._sampleRepository, id).pipe(
            catchError((error) =>
                this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getSampleRecord'))
            )
            );
        }


Using entity in a component

1. Listing
For components that use `McsTableDataSource2`, add the dataChangeEvent created above to notify your component whenever there are changes to the entity.

        public constructor(
            _injector: Injector,
            private _apiService: McsApiService
        ) {
            this.dataSource = new McsTableDataSource2<McsModelSample>(this._getTableData.bind(this));
            this.dataEvents = new McsTableEvents(_injector, this.dataSource, {
            dataChangeEvent: McsEvent.dataChangeSampleEvent
            });
        }


