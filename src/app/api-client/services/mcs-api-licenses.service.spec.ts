import {
    async,
    TestBed,
    getTestBed
} from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
/** Services and Models */
import { McsApiLicensesService } from './mcs-api-licenses.service';
import { McsApiClientTestingModule } from '../testing';

describe('LicensessApiService', () => {

    /** Stub Services Mock */
    let httpMock: HttpTestingController;
    let licensesApiService: McsApiLicensesService;

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
            licensesApiService = getTestBed().get(McsApiLicensesService);
        });
    }));

    /** Test Implementation */
    describe('getLicenses()', () => {
        it('should get all licenses from API calls', () => {
            licensesApiService.getLicenses().subscribe((response) => {
                expect(response).toBeDefined();
                expect(response.status).toBe(200);
                expect(response.totalCount).toBeGreaterThan(0);
            });
        });
    });
});
