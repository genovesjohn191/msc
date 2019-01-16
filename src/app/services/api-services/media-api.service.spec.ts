import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
/** Services and Models */
import { MediaApiService } from './media-api.service';
import {
  McsApiSuccessResponse,
  McsResourceMedia,
  McsResourceMediaServer
} from '@app/models';
import { ServicesTestingModule } from '../testing';

describe('MediaApiService', () => {

  /** Stub Services Mock */
  let httpMock: HttpTestingController;
  let mediaApiService: MediaApiService;
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
      mediaApiService = getTestBed().get(MediaApiService);
    });
  }));

  /** Test Implementation */
  describe('getMedia()', () => {
    it('should get media from API calls', () => {
      mediaApiService.getMedia({
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
        `/resources/media?page=${requestOptions.page}&per_page=${requestOptions.perPage}`
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
      let httpMockRequest = httpMock.expectOne(`/resources/media/${requestOptions.id}`);
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
      let httpMockRequest = httpMock.expectOne(`/resources/media/${requestOptions.id}/servers`);
      expect(httpMockRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsResourceMediaServer>();
      responseData.status = 200;
      responseData.totalCount = 5;
      httpMockRequest.flush(responseData);
    });
  });
});
