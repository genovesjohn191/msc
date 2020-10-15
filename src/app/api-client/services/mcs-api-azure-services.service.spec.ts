import { HttpTestingController } from '@angular/common/http/testing';
import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';

import { McsApiClientTestingModule } from '../testing';
/** Services and Models */
import { McsApiAzureServicesService } from './mcs-api-azure-services.service';

describe('SubscriptionsApiService', () => {

    /** Stub Services Mock */
    let httpMock: HttpTestingController;
    let subscriptionService: McsApiAzureServicesService;

    beforeEach(waitForAsync(() => {
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
            httpMock = TestBed.inject(HttpTestingController);
            subscriptionService = TestBed.inject(McsApiAzureServicesService);
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
