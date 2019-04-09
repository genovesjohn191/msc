import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ChangeDetectorRef
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import {
  IMcsDataChange,
  McsTableDataSource,
  McsTableSelection
} from '@app/core';
import { McsOrderApprover } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { McsOrdersRepository } from '@app/services';

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
  public approversColumns: string[];
  public approversDataSource: McsTableDataSource<McsOrderApprover>;
  public approversSelection: McsTableSelection<McsOrderApprover>;

  @Output()
  public dataChange = new EventEmitter<McsOrderApprover[]>();

  private _destroySubject = new Subject<void>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _translateService: TranslateService,
    private _ordersRepository: McsOrdersRepository
  ) {
    this.approversDataSource = new McsTableDataSource();
    this.approversSelection = new McsTableSelection(this.approversDataSource, true);
    this._setDataColumns();
  }

  public ngOnInit(): void {
    this._initializeDataSource();
    this._subscribeToApproverSelection();
  }

  /**
   * Event that emits whenever there are changes in the data
   */
  public notifyDataChange(): void {
    this.dataChange.emit(
      this.approversSelection.getSelectedItems()
    );
  }

  /**
   * Sets data column for the corresponding table
   */
  private _setDataColumns(): void {
    this.approversColumns = Object.keys(
      this._translateService.instant('orderApproval.columnHeaders')
    );
    if (isNullOrEmpty(this.approversColumns)) {
      throw new Error('column definition for order approvers was not defined');
    }
  }

  /**
   * Initializes the datasource of the order approvers
   */
  private _initializeDataSource(): void {
    this.approversDataSource.updateDatasource(
      this._ordersRepository.getOrderApprovers()
    );
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Subscribes to approver selection change
   */
  private _subscribeToApproverSelection(): void {
    this.approversSelection.dataSelectionChange().pipe(
      takeUntil(this._destroySubject)
    ).subscribe(() => this.notifyDataChange());
  }
}
