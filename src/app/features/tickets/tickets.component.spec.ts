import { EventEmitter } from '@angular/core';
import {
  async,
  TestBed,
  tick
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
import { TicketStatus } from './models';
import { TicketsComponent } from './tickets.component';
import { TicketsService } from './tickets.service';

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
    it('should get the totalRecordCount from the datasource', () => {
      expect(component.totalRecordCount).toBe(component.dataSource.totalRecordCount);
    });

    it('should get 0 to totalRecordCount when datasource is undefined', () => {
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

  describe('getStatusString()', () => {
    it('should get the equivalent string of the enumeration', () => {
      let stringEquivalent = component.getStatusString(TicketStatus.InProgress);
      expect(stringEquivalent).toBe('InProgress');
    });
  });

  describe('updateColumnSettings()', () => {
    it('should update the columns settings based on the new settings', () => {
      let columnSettings = { object: { text: 'sample', value: true } };
      component.updateColumnSettings(columnSettings);
      expect(component.columnSettings).toBe(columnSettings);
    });

    it('should update the data columns to be use in table based on the new settings', () => {
      let columnSettings = { header: { text: 'sample', value: true } };
      component.updateColumnSettings(columnSettings);
      expect(component.dataColumns.length).toBe(1);
      expect(component.dataColumns[0]).toBe('header');
    });
  });

  describe('dataSource()', () => {
    beforeEach(async(() => {
      component.paginator = {
        pageChangedStream: new EventEmitter(),
        pageIndex: 0,
        pageSize: 10,
        totalCount: 100,
        pageCompleted() { return; }
      } as McsPaginator;

      component.search = {
        keyword: undefined,
        searchChangedStream: new EventEmitter()
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
      if (dataSubscription) { dataSubscription.unsubscribe(); }
    });

    it('should set the paginator completed when onCompleted method is called', () => {
      spyOn(component.paginator, 'pageCompleted');
      component.dataSource.onCompletion(McsDataStatus.Success);
      expect(component.paginator.pageCompleted).toHaveBeenCalledTimes(1);
    });

    it('should set the totalRecordCount to 0 when disconnect method is called', () => {
      component.dataSource.disconnect();
      expect(component.dataSource.totalRecordCount).toBe(0);
    });
  });
});
