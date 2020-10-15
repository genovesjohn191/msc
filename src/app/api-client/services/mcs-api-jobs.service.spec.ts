import { HttpTestingController } from '@angular/common/http/testing';
import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';
import {
  McsApiSuccessResponse,
  McsJob
} from '@app/models';

import { McsApiClientTestingModule } from '../testing';
/** Services and Models */
import { McsApiJobsService } from './mcs-api-jobs.service';

describe('McsApiJobsService', () => {

  /** Stub Services Mock */
  let httpMock: HttpTestingController;
  let jobsApiService: McsApiJobsService;
  let requestOptions = {
    page: 1,
    perPage: 25,
    searchKeyword: 'start',
    id: 459
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
      jobsApiService = TestBed.inject(McsApiJobsService);
    });
  }));

  /** Test Implementation */
  describe('getJobs()', () => {
    it('should get all jobs from API calls', () => {
      jobsApiService.getJobs({
        pageIndex: requestOptions.page,
        pageSize: requestOptions.perPage,
        keyword: undefined
      }).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(2);
      });

      // Create request to the backend and expect that the request happened
      let httpMockRequest = httpMock.expectOne(
        `/jobs?page=${requestOptions.page}&per_page=${requestOptions.perPage}`
      );
      expect(httpMockRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsJob[]>();
      responseData.status = 200;
      responseData.totalCount = 2;
      httpMockRequest.flush(responseData);
    });
  });

  describe('getJob()', () => {
    it('should get the job based on ID from API calls', () => {
      jobsApiService.getJob(requestOptions.id)
        .subscribe((response) => {
          expect(response).toBeDefined();
          expect(response.status).toBe(200);
          expect(response.totalCount).toBe(1);
        });

      // Create request to the backend and expect that the request happened
      let httpMockRequest = httpMock.expectOne(`/jobs/${requestOptions.id}`);
      expect(httpMockRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsJob>();
      responseData.status = 200;
      responseData.totalCount = 1;
      httpMockRequest.flush(responseData);
    });
  });
});
