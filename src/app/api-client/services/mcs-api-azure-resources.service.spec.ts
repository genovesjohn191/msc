import { HttpTestingController } from '@angular/common/http/testing';
import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';

import { McsApiClientTestingModule } from '../testing';
/** Services and Models */
import { McsApiAzureResourcesService } from './mcs-api-azure-resources.service';

describe('AccountApiService', () => {

    /** Stub Services Mock */
    let httpMock: HttpTestingController;
    let azureResourcesService: McsApiAzureResourcesService;

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
            azureResourcesService = TestBed.inject(McsApiAzureResourcesService);
        });
    }));

    /** Test Implementation */
    describe('getResources()', () => {
        it('should get all azure resources from API calls', () => {
            azureResourcesService.getAzureResources().subscribe((response) => {
                expect(response).not.toBeNull();
                expect(response).toBeDefined();
                expect(response.status).toBe(200);
            });
        });
    });
});
