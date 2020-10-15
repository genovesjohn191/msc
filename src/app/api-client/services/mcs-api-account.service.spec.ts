import { HttpTestingController } from '@angular/common/http/testing';
import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';

import { McsApiClientTestingModule } from '../testing';
/** Services and Models */
import { McsApiAccountService } from './mcs-api-account.service';

describe('AccountApiService', () => {

    /** Stub Services Mock */
    let httpMock: HttpTestingController;
    let accountApiService: McsApiAccountService;

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
            accountApiService = TestBed.inject(McsApiAccountService);
        });
    }));

    /** Test Implementation */
    describe('getAccount()', () => {
        it('should get all licenses from API calls', () => {
            accountApiService.getAccount().subscribe((response) => {
                expect(response).not.toBeNull();
                expect(response).toBeDefined();
                expect(response.status).toBe(200);
            });
        });
    });
});
