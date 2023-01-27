import { HttpTestingController } from '@angular/common/http/testing';
import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';
/** Services and Models */
import {
  McsApiSuccessResponse,
  McsQueryParam,
  McsStorageSaasBackup,
  McsStorageVeeamBackup
} from '@app/models';

import { McsApiClientTestingModule } from '../testing';
import { McsApiStorageService } from './mcs-api-storage.service';

describe('McsApiStorageService', () => {

  /** Stub Services Mock */
  let httpMock: HttpTestingController;
  let storageService: McsApiStorageService;
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
      storageService = TestBed.inject(McsApiStorageService);
    });
  }));

  /** Test Implementation */
  describe('getVeeamBackups()', () => {
    it('should get all Veeam Cloud Backups from API calls', () => {
      let query = new McsQueryParam();
      query.pageIndex = requestOptions.page;
      query.pageSize = requestOptions.perPage;

      storageService.getVeeamBackups(query).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(2);
      });

      // Create request to the backend and expect that the request happened
      let httpRequest = httpMock.expectOne(
        `/storage/backup/veeam-cloud?page=${requestOptions.page}&per_page=${requestOptions.perPage}`
      );
      expect(httpRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsStorageVeeamBackup[]>();
      responseData.status = 200;
      responseData.totalCount = 2;
      httpRequest.flush(responseData);
    });
  });

  describe('getSaasBackups()', () => {
    it('should get all SaaS Backups from API calls', () => {
      let query = new McsQueryParam();
      query.pageIndex = requestOptions.page;
      query.pageSize = requestOptions.perPage;

      storageService.getSaasBackups(query).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.totalCount).toBe(2);
      });

      // Create request to the backend and expect that the request happened
      let httpRequest = httpMock.expectOne(
        `/storage/backup/saas?page=${requestOptions.page}&per_page=${requestOptions.perPage}`
      );
      expect(httpRequest.request.method).toEqual('GET');

      // Create response data and transmit, expect the result should go to subscribe callback
      let responseData = new McsApiSuccessResponse<McsStorageSaasBackup[]>();
      responseData.status = 200;
      responseData.totalCount = 2;
      httpRequest.flush(responseData);
    });
  });

});
