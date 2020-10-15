import { HttpTestingController } from '@angular/common/http/testing';
import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';

import { McsApiClientTestingModule } from '../testing';
/** Services and Models */
import { McsApiLicensesService } from './mcs-api-licenses.service';

describe('LicensessApiService', () => {

    /** Stub Services Mock */
    let httpMock: HttpTestingController;
    let licensesApiService: McsApiLicensesService;

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
            licensesApiService = TestBed.inject(McsApiLicensesService);
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
