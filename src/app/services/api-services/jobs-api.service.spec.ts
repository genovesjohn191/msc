import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
/** Services and Models */
import { JobsApiService } from './jobs-api.service';
import {
  McsApiSuccessResponse,
  McsJob
} from '@app/models';
import { ServicesTestingModule } from '../testing';

describe('JobsApiService', () => {

  /** Stub Services Mock */
  let httpMock: HttpTestingController;
  let jobsApiService: JobsApiService;
  let requestOptions = {
    page: 1,
    perPage: 25,
    searchKeyword: 'start',
    id: 459
  };

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      imports: [
        ServicesTestingModule
      ]
    });

    /** Testbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      httpMock = getTestBed().get(HttpTestingController);
      jobsApiService = getTestBed().get(JobsApiService);
    });
  }));

  /** Test Implementation */
  describe('getJobs()', () => {
    it('should get all jobs from API calls', () => {
      jobsApiService.getJobs({
        page: requestOptions.page,
        perPage: requestOptions.perPage,
        searchKeyword: undefined
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
