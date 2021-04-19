import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ChangeDetectorRef
} from '@angular/core';
import {
  Observable,
  Subject
} from 'rxjs';
import {
  takeUntil,
  map
} from 'rxjs/operators';
import {
  IMcsDataChange,
  McsMatTableContext,
  McsTableDataSource2,
  McsTableSelection2
} from '@app/core';
import {
  McsFilterInfo,
  McsOrderApprover
} from '@app/models';
import { createObject } from '@app/utilities';
import { McsApiService } from '@app/services';

@Component({
  selector: 'mcs-order-approval',
  templateUrl: './order-approval.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'order-approval-wrapper'
  }
})

export class OrderApprovalComponent implements OnInit, IMcsDataChange<McsOrderApprover[]> {

  public readonly dataSource: McsTableDataSource2<McsOrderApprover>;
  public readonly dataSelection: McsTableSelection2<McsOrderApprover>;
  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'select' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'name' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'emailAddress' }),
  ];

  @Output()
  public dataChange = new EventEmitter<McsOrderApprover[]>();

  private _destroySubject = new Subject<void>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService
  ) {
    this.dataSource = new McsTableDataSource2(this._getOrderApprovers.bind(this));
    this.dataSelection = new McsTableSelection2(this.dataSource, true);
    this.dataSource.registerColumnsFilterInfo(this.defaultColumnFilters);
  }

  public ngOnInit(): void {
    // this._initializeDataSource();
    this._subscribeToApproverSelection();
  }

  /**
   * Event that emits whenever there are changes in the data
   */
  public notifyDataChange(): void {
    this.dataChange.emit(
      this.dataSelection.getSelectedItems()
    );
  }

  /**
   * Initializes the datasource of the order approvers
   */
  // private _initializeDataSource(): void {
  //   this.dataSource.updateDatasource(this._getOrderApprovers());
  //   this._changeDetectorRef.markForCheck();
  // }

  private _getOrderApprovers(): Observable<McsMatTableContext<McsOrderApprover>> {
    return this._apiService.getOrderApprovers().pipe(
      map(response => new McsMatTableContext(response?.collection,
        response?.totalCollectionCount))
    );
  }

  /**
   * Subscribes to approver selection change
   */
  private _subscribeToApproverSelection(): void {
    this.dataSelection.dataSelectionChange().pipe(
      takeUntil(this._destroySubject)
    ).subscribe(() => this.notifyDataChange());
  }
}
