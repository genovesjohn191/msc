import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
/** Services and Models */
import { NotificationsService } from './notifications.service';
import {
  McsApiSuccessResponse,
  CoreDefinition
} from '../../core/';
import { NotificationsTestingModule } from './testing';

describe('NotificationsService', () => {

  /** Stub Services Mock */
  let httpMock: HttpTestingController;
  let notificationsService: NotificationsService;
  let requestOptions = {
    page: 1,
    perPage: CoreDefinition.NOTIFICATION_MAX_ITEM_PER_PAGE,
    searchKeyword: 'start',
    id: 459
  };

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      imports: [
        NotificationsTestingModule
      ]
    });

    /** Testbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      httpMock = getTestBed().get(HttpTestingController);
      notificationsService = getTestBed().get(NotificationsService);
    });
  }));

  /** Test Implementation */
  describe('getNotifications()', () => {
    it('should get all notifications from API calls', () => {
      notificationsService.getNotifications(
        requestOptions.page,
        requestOptions.perPage,
        undefined
      ).subscribe((response) => {
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
      let responseData = new McsApiSuccessResponse<Notification[]>();
      responseData.status = 200;
      responseData.totalCount = 2;
      httpMockRequest.flush(responseData);
    });
  });

  describe('getNotification()', () => {
    it('should get the notification based on ID from API calls', () => {
      notificationsService.getNotification(requestOptions.id)
        .subscribe((response) => {
          expect(response).toBeDefined();
          expect(response.status).toBe(200);
          expect(response.totalCount).toBe(1);
        });

      // Create request to the backend and expect that the request happened
      let httpMockRequest = httpMock.expectOne(`/job/${requestOptions.id}`);
      expect(httpMockRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<Notification>();
      responseData.status = 200;
      responseData.totalCount = 1;
      httpMockRequest.flush(responseData);
    });
  });
});
