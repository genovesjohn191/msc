import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  OnDestroy
} from '@angular/core';
import {
  Observable,
  of,
  Subject
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import { IMcsDataChange } from '@app/core';
import { McsServerCreateAddOnSqlServer } from '@app/models';
import {
  unsubscribeSafely,
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';

export type SqlServerOption = {
  category: string,
  options: string[]
};

@Component({
  selector: 'mcs-addon-sql-server',
  templateUrl: './addon-sql-server.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'addon-sql-server-wrapper'
  }
})

export class AddOnSqlServerComponent implements
  OnInit, OnDestroy, IMcsDataChange<McsServerCreateAddOnSqlServer> {

  public sqlServerOptions$: Observable<SqlServerOption[]>;
  public fgSqlServer: FormGroup<any>;
  public fcSqlServer: FormControl<any>;

  @Output()
  public dataChange = new EventEmitter<McsServerCreateAddOnSqlServer>();
  private _destroySubject = new Subject<void>();

  public ngOnInit(): void {
    this._subscribeToSqlServerOptions();
    this._registerFormGroup();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * Event that emits whenever there are changes in the data
   */
  public notifyDataChange(): void {
    let sqlServer = getSafeProperty(this.fcSqlServer, (obj) => obj.value);
    if (isNullOrEmpty(sqlServer)) { return; }

    let sqlServerRef = new McsServerCreateAddOnSqlServer();
    sqlServerRef.sqlServer = sqlServer;
    this.dataChange.emit(sqlServerRef);
  }

  /**
   * Subscribe to sql server options
   */
  private _subscribeToSqlServerOptions(): void {
    // TODO: This should be obtained on api, ask business
    this.sqlServerOptions$ = of([
      {
        category: 'Web',
        options: [
          'SQL Server 2012 Web',
          'SQL Server 2014 Web',
          'SQL Server 2016 Web'
        ]
      },
      {
        category: 'Standard',
        options: [
          'SQL Server 2012 Standard',
          'SQL Server 2014 Standard',
          'SQL Server 2016 Standard',
          'SQL Server 2017 Standard'
        ]
      },
      {
        category: 'Enterprise',
        options: [
          'SQL Server 2012 Enterprise',
          'SQL Server 2014 Enterprise',
          'SQL Server 2016 Enterprise',
          'SQL Server 2017 Enterprise'
        ]
      },
    ]);
  }

  /**
   * Registers all form group on the sql
   */
  private _registerFormGroup(): void {
    // Register Form Groups using binding
    this.fcSqlServer = new FormControl<any>('');

    this.fgSqlServer = new FormGroup<any>({
      fcSqlServer: this.fcSqlServer
    });
    this.fgSqlServer.valueChanges.pipe(
      takeUntil(this._destroySubject)
    ).subscribe(this.notifyDataChange.bind(this));
  }
}
