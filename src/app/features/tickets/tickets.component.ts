import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit
} from '@angular/core';
/** Services */
import {
  McsPaginator,
  McsSearch,
  McsTextContentProvider,
  CoreDefinition
} from '../../core';
import {
  formatDate,
  isNullOrEmpty,
  getEnumString,
  refreshView,
  convertDateToStandardString
} from '../../utilities';
import { TicketsService } from './tickets.service';
import { TicketsDataSource } from './tickets.datasource';
import { TicketStatus } from './models';

@Component({
  selector: 'mcs-tickets',
  templateUrl: './tickets.component.html',
  styles: [require('./tickets.component.scss')]
})

export class TicketsComponent implements OnInit, AfterViewInit, OnDestroy {

  public textContent: any;

  // Filter selector variables
  public columnSettings: any;

  // Table variables
  public dataSource: TicketsDataSource;
  public dataColumns: string[];

  @ViewChild('search')
  public search: McsSearch;

  @ViewChild('paginator')
  public paginator: McsPaginator;

  public get totalRecordCount(): number {
    return isNullOrEmpty(this.dataSource) ? 0 : this.dataSource.totalRecordCount;
  }

  public get columnSettingsKey(): string {
    return CoreDefinition.FILTERSELECTOR_TICKET_LISTING;
  }

  constructor(
    private _textContentProvider: McsTextContentProvider,
    private _ticketsService: TicketsService
  ) {
    this.dataColumns = new Array();
  }

  public ngOnInit(): void {
    this.textContent = this._textContentProvider.content.tickets;
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this._initiliazeDatasource();
    });
  }

  public ngOnDestroy(): void {
    if (!isNullOrEmpty(this.dataSource)) {
      this.dataSource.disconnect();
    }
    if (!isNullOrEmpty(this.dataColumns)) {
      this.dataColumns = [];
      this.dataColumns = null;
    }
  }

  /**
   * Return the status string based on enumeration type
   * @param status Enumeration status to be converted
   */
  public getStatusString(status: TicketStatus) {
    return getEnumString(TicketStatus, status);
  }

  /**
   * Converts the date and time to string based on standard format
   * @param date Date to be converted
   */
  public convertDateTimeToString(date: Date): string {
    return convertDateToStandardString(date);
  }

  /**
   * Update the column settings based on filtered selectors
   * and update the data column of the table together
   * @param columns New column settings
   */
  public updateColumnSettings(columns: any): void {
    if (columns) {
      this.columnSettings = columns;
      let columnDetails = Object.keys(this.columnSettings);

      this.dataColumns = [];
      columnDetails.forEach((column) => {
        if (!this.columnSettings[column].value) { return; }
        this.dataColumns.push(column);
      });
    }
  }

  /**
   * Retry to obtain the source from API
   */
  public retryDatasource(): void {
    if (isNullOrEmpty(this.dataSource)) { return; }
    this._initiliazeDatasource();
  }

  /**
   * Initialize the table datasource according to pagination and search settings
   */
  private _initiliazeDatasource(): void {
    // Set datasource
    this.dataSource = new TicketsDataSource(
      this._ticketsService,
      this.paginator,
      this.search
    );
  }
}
