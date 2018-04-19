import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { McsTextContentProvider } from '../../../../../core';
import {
  unsubscribeSafely,
  isNullOrEmpty
} from '../../../../../utilities';
import { OptionsApiService } from '../../../../services';
import {
  ServerSqlOptions,
  ServerSql
} from '../../../models';

@Component({
  selector: 'mcs-sql-server',
  templateUrl: './sql-server.addon.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'sql-server-wrapper'
  }
})

export class SqlServerAddOnComponent implements OnInit, OnDestroy {
  public textContent: any;
  public sqlServerOptions: ServerSqlOptions;
  public sqlServer: ServerSql;
  public sqlServerVersions: string[];
  public sqlServerEditions: string[];
  public sqlServerArchitectures: string[];

  public selectedSqlServerVersion: string;
  public selectedSqlServerEdition: string;
  public selectedSqlServerArchitecture: string;

  @Output()
  public change: EventEmitter<ServerSql> = new EventEmitter();

  private _sqlServerOptionsSubscription: Subscription;

  public constructor(
    private _textProvider: McsTextContentProvider,
    private _optionsApiService: OptionsApiService
  ) {
    this.sqlServerOptions = new ServerSqlOptions();
    this.sqlServerVersions = new Array();
    this.sqlServerEditions = new Array();
    this.sqlServerArchitectures = new Array();
    this.sqlServer = new ServerSql();
  }

  public ngOnInit(): void {
    this.textContent = this._textProvider.content.servers.shared.sqlServerAddOn;
    this._getSqlServerOptions();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._sqlServerOptionsSubscription);
  }

  /**
   * This will return true if the option needs to
   * be included in the select dropdown
   * @param option Select dropdown option
   */
  public isOptionIncluded(option: string): boolean {
    let isIncluded: boolean;

    switch (option) {
      case 'Datacenter':
        // Datacenter will be included if
        // 2012 SP3 was selected as version
        isIncluded = this.selectedSqlServerVersion === '2012 SP3';
        break;

      default:
        isIncluded = true;
        break;
    }

    return isIncluded;
  }

  /**
   * This will set the sql server version value
   * and notify change parameter
   */
  public onVersionChanged(): void {
    // TODO: Will refactor this when the API is ready
    if (this.selectedSqlServerVersion !== '2012 SP3' &&
      this.selectedSqlServerEdition === 'Datacenter') {
      this.selectedSqlServerEdition = this._setSelectDefaultValue(
        this.sqlServerOptions.editions, 0);
    }
    this._notifyChangeParameter();
  }

  /**
   * This will set the sql server edition value
   * and notify change parameter
   */
  public onEditionChanged(): void {
    this._notifyChangeParameter();
  }

  /**
   * This will set the sql server architecture value
   * and notify change parameter
   */
  public onArchitectureChanged(): void {
    this._notifyChangeParameter();
  }

  /**
   * Get sql server options from the API
   */
  private _getSqlServerOptions(): void {
    this._sqlServerOptionsSubscription = this._optionsApiService.getSqlServerOptions()
      .subscribe((response) => {
        if (isNullOrEmpty(response)) { return; }

        this.sqlServerOptions = response.content;

        if (!isNullOrEmpty(this.sqlServerOptions)) {
          this._setSqlServerVersions(this.sqlServerOptions.versions);
          this._setSqlServerEditions(this.sqlServerOptions.editions);
          this._setSqlServerArchitectures(this.sqlServerOptions.architectures);

          this.selectedSqlServerVersion = this._setSelectDefaultValue(
            this.sqlServerOptions.versions, 10);
          this.selectedSqlServerEdition = this._setSelectDefaultValue(
            this.sqlServerOptions.editions, 0);
          this.selectedSqlServerArchitecture = this._setSelectDefaultValue(
            this.sqlServerOptions.architectures, 0);
        }
      });
  }

  /**
   * Set SQL Server Versions
   * @param versions Sql server versions
   */
  private _setSqlServerVersions(versions: string[]): void {
    if (isNullOrEmpty(versions)) { return; }
    this.sqlServerVersions = versions;
  }

  /**
   * Set SQL Server Editions
   * @param editions Sql server versions
   */
  private _setSqlServerEditions(editions: string[]): void {
    if (isNullOrEmpty(editions)) { return; }
    this.sqlServerEditions = editions;
  }

  /**
   * Set SQL Server Architectures
   * @param architectures Sql server versions
   */
  private _setSqlServerArchitectures(architectures: string[]): void {
    if (isNullOrEmpty(architectures)) { return; }
    this.sqlServerArchitectures = architectures;
  }

  /**
   * Set the default value of the select dropdown
   * @param options Options where to select the value
   * @param index Index of the value to be set
   */
  private _setSelectDefaultValue(options: string[], index: number): string {
    if (isNullOrEmpty(options)) { return undefined; }

    return (index >= 0 && index < (options.length)) ?
      options[index] : options[0];
  }

  /**
   * Event that emits whenever there are changes in the model
   */
  private _notifyChangeParameter(): void {
    this.sqlServer.version = this.selectedSqlServerVersion;
    this.sqlServer.edition = this.selectedSqlServerEdition;
    this.sqlServer.architecture = this.selectedSqlServerArchitecture;
    this.change.emit(this.sqlServer);
  }
}
