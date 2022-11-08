import { HttpTestingController } from '@angular/common/http/testing';
import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';
/** Services and Models */
import {
  McsApiSuccessResponse,
  McsDrVeeamCloud,
  McsQueryParam
} from '@app/models';

import { McsApiClientTestingModule } from '../testing';
import { McsApiDrService } from './mcs-api-dr.service';

describe('McsApiStorageService', () => {

  /** Stub Services Mock */
  let httpMock: HttpTestingController;
  let drService: McsApiDrService;
  let requestOptions = {
    page: 1,
    perPage: 10,
  };

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      imports: [
        McsApiClientTestingModule
      ]
    });

    /** Testbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      httpMock = TestBed.inject(HttpTestingController);
      drService = TestBed.inject(McsApiDrService);
    });
  }));

  /** Test Implementation */
  describe('getVeeamDrs()', () => {
    it('should get all Disaster Recovery Veeam from API calls', () => {
      let query = new McsQueryParam();
      query.pageIndex = requestOptions.page;
      query.pageSize = requestOptions.perPage;

      drService.getVeeamCloudDrs(query).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(2);
      });

      // Create request to the backend and expect that the request happened
      let httpRequest = httpMock.expectOne(
        `/private-cloud/disaster-recovery/veeam-cloud?page=${requestOptions.page}&per_page=${requestOptions.perPage}`
      );
      expect(httpRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsDrVeeamCloud[]>();
      responseData.status = 200;
      responseData.totalCount = 2;
      httpRequest.flush(responseData);
    });
  });

});
