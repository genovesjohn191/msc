import {
    async,
    TestBed,
    getTestBed
} from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
/** Services and Models */
import { McsApiAzureServicesService } from './mcs-api-azure-services.service';
import { McsApiClientTestingModule } from '../testing';

describe('SubscriptionsApiService', () => {

    /** Stub Services Mock */
    let httpMock: HttpTestingController;
    let subscriptionService: McsApiAzureServicesService;

    beforeEach(async(() => {
        /** Testbed Reset Module */
        TestBed.resetTestingModule();

        /** Testbed Configuration */
        TestBed.configureTestingModule({
            imports: [
                McsApiClientTestingModule
            ]
        });

        /** Tesbed Component Compilation and Creation */
        TestBed.compileComponents().then(() => {
            httpMock = getTestBed().get(HttpTestingController);
            subscriptionService = getTestBed().get(McsApiAzureServicesService);
        });
    }));

    /** Test Implementation */
    describe('getAzureServices()', () => {
        it('should get all subscription from API calls', () => {
            subscriptionService.getAzureServices().subscribe((response) => {
                expect(response).not.toBeNull();
                expect(response).toBeDefined();
                expect(response.status).toBe(200);
            });
        });
    });
});
