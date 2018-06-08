import { EventEmitter } from '@angular/core';
import {
  async,
  TestBed
} from '@angular/core/testing';
import {
  CoreDefinition,
  McsPaginator,
  McsSearch,
  McsDataStatus
} from '../../core';
import {
  TicketsTestingModule,
  mockTicketsService
} from './testing';
import { TicketsComponent } from './tickets.component';
import { TicketsService } from './tickets.service';
import { unsubscribeSafely } from '../../utilities';

describe('TicketsComponent', () => {

  /** Stub Services/Components */
  let component: TicketsComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TicketsComponent
      ],
      imports: [
        TicketsTestingModule
      ]
    });

    /** Testbed Onverriding of Providers */
    TestBed.overrideProvider(TicketsService, { useValue: mockTicketsService });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TicketsComponent, {
      set: {
        template: `
          <div>TicketsComponent Template</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(TicketsComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      component.ngAfterViewInit();
    });
  }));

  /** Test Implementation */
  describe('ngOnInit() | constructor', () => {
    it('should defined the text content', () => {
      expect(component.textContent).toBeDefined();
    });

    it('should initialize the datasource of the table', () => {
      expect(component.dataSource).toBeDefined();
    });
  });

  describe('totalRecordCount()', () => {
    it('should get 0 to totalRecordCount', () => {
      component.dataSource = undefined;
      expect(component.totalRecordCount).toBe(0);
    });
  });

  describe('columnSettingsKey()', () => {
    it('should get the column settings key from the filter configuration', () => {
      expect(component.columnSettingsKey).toBe(CoreDefinition.FILTERSELECTOR_TICKET_LISTING);
    });
  });

  describe('ngOnDestroy()', () => {
    it('should disconnect the datasource from connection', () => {
      spyOn(component.dataSource, 'disconnect');
      component.ngOnDestroy();
      expect(component.dataSource.disconnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('dataSource()', () => {
    beforeEach(async(() => {
      component.paginator = {
        pageChangedStream: new EventEmitter(),
        pageIndex: 0,
        pageSize: 10,
        totalCount: 100,
        showLoading() { return; }
      } as McsPaginator;

      component.search = {
        keyword: undefined,
        showLoading: () => {
          // Dummy content
        },
        searchChangedStream: new EventEmitter(),
        searching: false
      } as McsSearch;

      component.ngAfterViewInit();
    }));

    it('should get the data from the connect method', () => {
      /** Data should be similar from the mock provided */
      let dataSubscription = component.dataSource.connect()
        .subscribe((data) => {
          expect(data).not.toBeNull();
          expect(data.length).toBe(2);
        });
      unsubscribeSafely(dataSubscription);
    });

    it('should set the paginator completed when onCompleted method is called', () => {
      spyOn(component.paginator, 'showLoading');
      component.dataSource.onCompletion(McsDataStatus.Success);
      expect(component.paginator.showLoading).toHaveBeenCalledTimes(1);
    });

    it('should set the totalRecordCount to 0 when disconnect method is called', () => {
      component.dataSource.disconnect();
      expect(component.totalRecordCount).toBe(0);
    });
  });
});
