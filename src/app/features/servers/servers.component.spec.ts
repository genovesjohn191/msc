import {
  async,
  inject,
  TestBed,
  fakeAsync,
  discardPeriodicTasks
} from '@angular/core/testing';
import { Observable } from 'rxjs/Rx';
import {
  McsTextContentProvider,
  McsAssetsProvider,
  CoreDefinition
} from '../../core';

import { Server } from './server';
import { ServerListSearchKey } from './sever-list-search-key';
import { ServersComponent } from './servers.component';
import { ServersService } from './servers.service';
import { McsApiSuccessResponse } from '../../core';

describe('ServersComponent', () => {

  /** Stub Services/Components */
  CoreDefinition.SEARCH_TIME = 0; // remove delay time
  let component: ServersComponent;
  let pageTitle: string = 'title';
  let serversServiceMock = {
    getServers(
      page?: number,
      perPage?: number,
      serverName?: string): Observable<McsApiSuccessResponse<Server[]>> {

      let mcsApiResponseMock = new McsApiSuccessResponse<Server[]>();
      mcsApiResponseMock.status = 200;
      mcsApiResponseMock.totalCount = 2;
      mcsApiResponseMock.content = new Array(new Server(), new Server());

      return Observable.of(mcsApiResponseMock);
    }
  };
  let textContentProviderMock = {
    content: {
      servers: {
        title: pageTitle
      }
    }
  };
  let assetsProviderMock = {
    getIcon(iconClass: string) {
      return iconClass;
    }
  };

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ServersComponent
      ],
      imports: [
      ],
      providers: [
        { provide: McsTextContentProvider, useValue: textContentProviderMock },
        { provide: ServersService, useValue: serversServiceMock },
        { provide: McsAssetsProvider, useValue: assetsProviderMock }
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ServersComponent, {
      set: {
        template: `
          <div>Overridden template here</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(ServersComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit() | constructor', () => {
    it('should set the title page', () => {
      expect(component.title).toEqual(pageTitle);
    });

    it('should acquire the class of font-awesome gear', () => {
      expect(component.gear).toEqual('gear');
    });

    it('should create a searchSubject instance as a keyword listener', () => {
      expect(component.searchSubject).toBeDefined();
    });

    it('should set the servers value', () => {
      expect(component.servers).toBeDefined();
      expect(component.servers.length).toEqual(2);
    });

    it('should set the total count value', () => {
      expect(component.totalServerCount).toEqual(2);
    });
  });

  describe('getNextPage()', () => {
    let previousPage = 0;
    let previousDisplayedCount = 0;

    beforeEach(async () => {
      previousPage = component.page;
      previousDisplayedCount = component.getDisplayServerCount();
      spyOn(component, 'updateServers');
      component.getNextPage();
    });

    it('should increase the page by 1', () => {
      expect(component.page).toEqual(previousPage + 1);
    });

    it('should increase the displayed items', () => {
      expect(component.getDisplayServerCount())
        .toEqual(CoreDefinition.SERVER_LIST_MAX_ITEM_PER_PAGE * component.page);
    });

    it('should call the updateServers method 1 time with parameter keyword and page', () => {
      expect(component.updateServers).toHaveBeenCalledTimes(1);
      expect(component.updateServers).toHaveBeenCalledWith(component.keyword, component.page);
    });
  });

  describe('searchServers()', () => {
    let searchKeyword = 'mongo';

    beforeEach(async () => {
      spyOn(component, 'updateServers');
      component.searchServers(searchKeyword);
    });

    it('should initialize the page and displayServerCount value to default', () => {
      expect(component.page).toEqual(1);
      expect(component.getDisplayServerCount()).toEqual(10);
    });

    it('should update the keyword value', () => {
      expect(component.keyword).toEqual(searchKeyword);
    });

    it('should call the updateServers method 1 time with parameter keyword and page', () => {
      expect(component.updateServers).toHaveBeenCalledTimes(1);
      expect(component.updateServers).toHaveBeenCalledWith(component.keyword, component.page);
    });
  });

  describe('updateServers()', () => {
    let keyword: string = 'mongo';
    let page: number = 1;
    let searchKey: ServerListSearchKey = new ServerListSearchKey();

    beforeEach(async () => {
      searchKey.maxItemPerPage = 10;
      searchKey.page = page;
      searchKey.serverNameKeyword = keyword;

      spyOn(component.searchSubject, 'next');
      component.updateServers(keyword, page);
    });

    it('should call the next of searchSubject 1 time with parameter of searchKey', () => {
      expect(component.searchSubject.next).toHaveBeenCalledTimes(1);
      expect(component.searchSubject.next).toHaveBeenCalledWith(searchKey);
    });

    it('should set the isLoaded flag to false', () => {
      expect(component.isLoaded).toEqual(false);
    });
  });

  describe('onUpdateColumnSettings()', () => {
    it('should update the columnSettings', () => {
      let columnSettings = new Array<string>('mongo');
      component.onUpdateColumnSettings(columnSettings);
      expect(component.columnSettings).toEqual(columnSettings);
    });
  });

  describe('ngOnDestroy()', () => {
    it('should destroy the subscription of searchSubject', () => {
      spyOn(component.searchSubscription, 'unsubscribe');
      component.ngOnDestroy();
      expect(component.searchSubscription.unsubscribe).toHaveBeenCalledTimes(1);
    });
  });
});
