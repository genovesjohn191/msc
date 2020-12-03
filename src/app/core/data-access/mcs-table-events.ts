import { Subscription } from 'rxjs';

import {
  ChangeDetectorRef,
  Injector
} from '@angular/core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  McsDisposable
} from '@app/utilities';
import {
  EventBusDispatcherService,
  EventBusState
} from '@peerlancers/ngx-event-bus';

import { McsTableDataSource2 } from './mcs-table-datasource2';

export interface McsTableEventsConfig<TEntity> {
  dataChangeEvent?: EventBusState<TEntity[]>;
  dataClearEvent?: EventBusState<void>;
  entityDeleteEvent?: EventBusState<any>;
}

export class McsTableEvents<TEntity> implements McsDisposable {
  private _dataChangeHandler: Subscription;
  private _dataClearHandler: Subscription;
  private _entityDeleteHandler: Subscription;

  private readonly _changeDetectorRef: ChangeDetectorRef;
  private readonly _eventDispatcher: EventBusDispatcherService;

  constructor(
    _injector: Injector,
    private _dataSource: McsTableDataSource2<TEntity>,
    private _dataConfig: McsTableEventsConfig<TEntity>
  ) {
    this._changeDetectorRef = _injector.get(ChangeDetectorRef);
    this._eventDispatcher = _injector.get(EventBusDispatcherService);

    this._validateDatasource();
    this._registerDataEvents();
  }

  public dispose(): void {
    unsubscribeSafely(this._dataChangeHandler);
    unsubscribeSafely(this._dataClearHandler);
    unsubscribeSafely(this._entityDeleteHandler);
  }

  private _registerDataEvents(): void {
    if (!isNullOrEmpty(this._dataConfig.dataChangeEvent)) {
      this._dataChangeHandler = this._eventDispatcher.addEventListener(
        this._dataConfig.dataChangeEvent, this._onDataChange.bind(this)
      );
    }

    if (!isNullOrEmpty(this._dataConfig.dataClearEvent)) {
      this._dataClearHandler = this._eventDispatcher.addEventListener(
        this._dataConfig.dataClearEvent, this._onDataClear.bind(this)
      );
    }

    if (!isNullOrEmpty(this._dataConfig.entityDeleteEvent)) {
      this._entityDeleteHandler = this._eventDispatcher.addEventListener(
        this._dataConfig.entityDeleteEvent, this._onDeleteRecord.bind(this)
      );
    }
  }

  private _onDataChange(): void {
    this._changeDetectorRef.markForCheck();
  }

  private _onDataClear(): void {
    if (isNullOrEmpty(this._dataSource)) { return; }
    this._dataSource.refreshDataRecords();
    this._changeDetectorRef.markForCheck();
  }

  private _onDeleteRecord(): void {
    if (isNullOrEmpty(this._dataSource)) { return; }
    this._dataSource.refreshDataRecords();
    this._changeDetectorRef.markForCheck();
  }

  private _validateDatasource(): void {
    if (isNullOrEmpty(this._dataSource)) {
      throw new Error(`Datasource for table events must not be empty.`);
    }
  }
}
