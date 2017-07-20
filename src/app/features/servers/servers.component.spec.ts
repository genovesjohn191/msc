import {
  async,
  TestBed
} from '@angular/core/testing';
import {
  Observable,
  Subject
} from 'rxjs/Rx';
import {
  CoreDefinition,
  McsApiSearchKey
} from '../../core';

import { Server } from './models';
import { ServersComponent } from './servers.component';
import { ServersService } from './servers.service';
import {
  ServersTestingModule,
  mockServersService
} from './testing';

describe('ServersComponent', () => {

  /** Stub Services/Components */
  CoreDefinition.SEARCH_TIME = 0; // remove delay time
  let component: ServersComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ServersComponent
      ],
      imports: [
        ServersTestingModule
      ]
    });

    /** Testbed Onverriding of Providers */
    TestBed.overrideProvider(ServersService, { useValue: mockServersService });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ServersComponent, {
      set: {
        template: `
          <div>Servers Component Template</div>
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

  describe('IconKey() Properties', () => {
    it('should get the gear icon key definition', () => {
      expect(component.gearIconKey).toBe(CoreDefinition.ASSETS_FONT_GEAR);
    });

    it('shouldget the spinner icon key definition', () => {
      expect(component.spinnerIconKey).toBe(CoreDefinition.ASSETS_FONT_SPINNER);
    });

    it('shouldget the arrow down icon key definition', () => {
      expect(component.arrowDownIconKey).toBe(CoreDefinition.ASSETS_FONT_CHEVRON_DOWN);
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
    let searchKey: McsApiSearchKey = new McsApiSearchKey();

    beforeEach(async () => {
      searchKey.maxItemPerPage = 10;
      searchKey.page = page;
      searchKey.keyword = keyword;

      spyOn(component.searchSubject, 'next');
      component.updateServers(keyword, page);
    });

    it('should call the next of searchSubject 1 time with parameter of searchKey', () => {
      expect(component.searchSubject.next).toHaveBeenCalledTimes(1);
      expect(component.searchSubject.next).toHaveBeenCalledWith(searchKey);
    });

    it('should set the isLoading flag to true', () => {
      expect(component.isLoading).toEqual(true);
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

  describe('loadedSuccessfully()', () => {
    it('should set to loadedSuccessfully to true when done loading and thrown an error', () => {
      component.isLoading = false;
      component.hasError = true;
      expect(component.loadedSuccessfully).toBeFalsy();
    });
  });

  describe('noServers()', () => {
    it('should set to noServers to true after loading and no servers to display', () => {
      component.isLoading = false;
      component.keyword = '';
      component.totalServerCount = 0;
      expect(component.noServers).toBeTruthy();
    });
  });

  describe('emptySearchResult()', () => {
    it('should set to noServersFound to true after loading and no servers found on filter', () => {
      component.isLoading = false;
      component.keyword = 'staging';
      component.totalServerCount = 0;
      expect(component.emptySearchResult).toBeTruthy();
    });
  });
});
