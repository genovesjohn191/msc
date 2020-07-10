import {
    async,
    TestBed,
    getTestBed
} from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
/** Services and Models */
import { McsApiAccountService } from './mcs-api-account.service';
import { McsApiClientTestingModule } from '../testing';

describe('AccountApiService', () => {

    /** Stub Services Mock */
    let httpMock: HttpTestingController;
    let accountApiService: McsApiAccountService;

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
            accountApiService = getTestBed().get(McsApiAccountService);
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
