import {
  Component,
  ViewChild
} from '@angular/core';
import {
  async,
  TestBed
} from '@angular/core/testing';
import { TableComponent } from './table.component';
import { TableModule } from './table.module';
import { TableDatasource } from './testing';
import { CoreTestingModule } from '@app/core/testing';

@Component({
  selector: 'mcs-test-table',
  template: ``
})
export class TestTableComponent {
  @ViewChild(TableComponent)
  public tableComponent: TableComponent<any>;

  public dataSource: TableDatasource;
  constructor() {
    this.dataSource = new TableDatasource();
  }
}

describe('TableComponent', () => {

  /** Stub Services/Components */

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestTableComponent
      ],
      imports: [
        TableModule,
        CoreTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestTableComponent, {
      set: {
        template: `
        <mcs-table [dataSource]="dataSource">
          <ng-container mcsColumnDef="name">
            <mcs-header-cell *mcsHeaderCellDef> Name </mcs-header-cell>
            <mcs-data-cell *mcsDataCellDef="let row"> {{row.name}} </mcs-data-cell>
          </ng-container>

          <ng-container mcsColumnDef="userId">
            <mcs-header-cell *mcsHeaderCellDef> User ID </mcs-header-cell>
            <mcs-data-cell *mcsDataCellDef="let row"> {{row.userId}} </mcs-data-cell>
          </ng-container>

          <mcs-header-row *mcsHeaderRowDef="['name','userId']"></mcs-header-row>
          <mcs-data-row *mcsDataRowDef="let row; columns: ['name','userId'];"></mcs-data-row>
        </mcs-table>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(TestTableComponent);
      fixture.detectChanges();
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the mcs-table element`, () => {
      let tableElement: any;
      tableElement = document.querySelector('mcs-table');
      expect(tableElement).not.toBe(null);
    });
  });

  describe('ngAfterContentInit() | ngAfterContentChecked()', () => {
    it(`should create 1 mcs-header-row element`, () => {
      let headerRowElement: NodeListOf<Element>;
      headerRowElement = document.querySelectorAll('mcs-header-row');
      expect(headerRowElement.length).toBe(1);
    });

    it(`should create mcs-header-cell element based on the cell data of header`, () => {
      let headerCellElement: NodeListOf<Element>;
      headerCellElement = document.querySelectorAll('mcs-header-cell');
      expect(headerCellElement.length).toBe(2);
    });

    it(`should create mcs-data-row element based on the datasource record`, () => {
      let dataRowElement: NodeListOf<Element>;
      dataRowElement = document.querySelectorAll('mcs-data-row');
      expect(dataRowElement.length).toBe(3);
    });

    it(`should create mcs-data-cell element based on the datasource record`, () => {
      let dataRowElement: NodeListOf<Element>;
      dataRowElement = document.querySelectorAll('mcs-data-cell');
      expect(dataRowElement.length).not.toBe(0);
    });
  });
});
