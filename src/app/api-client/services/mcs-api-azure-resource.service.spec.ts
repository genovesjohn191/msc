import {
    async,
    TestBed,
    getTestBed
} from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
/** Services and Models */
import { McsApiAzureResourceService } from './mcs-api-azure-resource.service';
import { McsApiClientTestingModule } from '../testing';

describe('AccountApiService', () => {

    /** Stub Services Mock */
    let httpMock: HttpTestingController;
    let azureResourcesService: McsApiAzureResourceService;

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
            azureResourcesService = getTestBed().get(McsApiAzureResourceService);
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
