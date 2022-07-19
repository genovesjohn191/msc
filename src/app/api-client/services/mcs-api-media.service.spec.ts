import { HttpTestingController } from '@angular/common/http/testing';
import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';
import {
  McsApiSuccessResponse,
  McsQueryParam,
  McsResourceMedia,
  McsResourceMediaServer
} from '@app/models';

import { McsApiClientTestingModule } from '../testing';
/** Services and Models */
import { McsApiMediaService } from './mcs-api-media.service';

describe('McsApiMediaService', () => {

  /** Stub Services Mock */
  let httpMock: HttpTestingController;
  let mediaApiService: McsApiMediaService;
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
      mediaApiService = TestBed.inject(McsApiMediaService);
    });
  }));

  /** Test Implementation */
  describe('getMedia()', () => {
    it('should get media from API calls', () => {
      let query = new McsQueryParam();
      query.pageIndex = requestOptions.page;
      query.pageSize = requestOptions.perPage;

      mediaApiService.getMedia(query).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(2);
      });

      // Create request to the backend and expect that the request happened
      let httpMockRequest = httpMock.expectOne(
        `/private-cloud/resources/media?page=${requestOptions.page}&per_page=${requestOptions.perPage}`
      );
      expect(httpMockRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsResourceMedia[]>();
      responseData.status = 200;
      responseData.totalCount = 2;
      httpMockRequest.flush(responseData);
    });
  });

  describe('getMedium()', () => {
    it('should get the media details based on ID from API calls', () => {
      mediaApiService.getMedium(requestOptions.id)
        .subscribe((response) => {
          expect(response).toBeDefined();
          expect(response.status).toBe(200);
          expect(response.totalCount).toBe(1);
        });

      // Create request to the backend and expect that the request happened
      let httpMockRequest = httpMock.expectOne(`/private-cloud/resources/media/${requestOptions.id}`);
      expect(httpMockRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsResourceMedia>();
      responseData.status = 200;
      responseData.totalCount = 1;
      httpMockRequest.flush(responseData);
    });
  });

  describe('getMediaServers()', () => {
    it('should get the media servers based on media ID from API calls', () => {
      mediaApiService.getMediaServers(requestOptions.id)
        .subscribe((response) => {
          expect(response).toBeDefined();
          expect(response.status).toBe(200);
          expect(response.totalCount).toBe(5);
        });

      // Create request to the backend and expect that the request happened
      let httpMockRequest = httpMock.expectOne(`/private-cloud/resources/media/${requestOptions.id}/servers`);
      expect(httpMockRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsResourceMediaServer>();
      responseData.status = 200;
      responseData.totalCount = 5;
      httpMockRequest.flush(responseData);
    });
  });
});
