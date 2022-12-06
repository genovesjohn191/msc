import {
  ChangeDetectionStrategy, 
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { 
  Observable, 
  throwError 
} from 'rxjs';
import {
  catchError,
  map
} from 'rxjs/operators';
import {
  McsMatTableContext, 
  McsReportingService,
  McsTableDataSource2
} from '@app/core';
import {
  AffectedPlatform,
  Category,
  McsFilterInfo, 
  McsPlannedWork,
  McsPlannedWorkQueryParams
} from '@app/models';
import {
  createObject
} from '@app/utilities';

@Component({
  selector: 'mcs-planned-work-widget',
  templateUrl: './planned-work-widget.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class PlannedWorkWidgetComponent implements OnInit {

  @Input()
  public set category(value: Category) {
    this._category = value;
    this.retryDatasource();
  };

  @Input()
  public set isPrivateCloud(value: boolean) {
    this._affectedPlatform = value ? "private" : "public";
    this.retryDatasource();
  };
    
  @Output()
  public dataChange = new EventEmitter<McsPlannedWork[]>(null);

  public readonly dataSource: McsTableDataSource2<McsPlannedWork>;
  public readonly defaultColumnFilters: McsFilterInfo[];
  private _category: Category;
  private _affectedPlatform: AffectedPlatform;

  constructor(
    private _reportingService: McsReportingService
  ) {
    this.dataSource = new McsTableDataSource2(this._getPlannedWorks.bind(this));
    this.defaultColumnFilters = [
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'status' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'type' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'summary' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'plannedStart' })
    ];
  }

  public ngOnInit(): void {
    this.dataSource.registerColumnsFilterInfo(this.defaultColumnFilters);
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  private _getPlannedWorks(): Observable<McsMatTableContext<McsPlannedWork>> {
    this.dataChange.emit(undefined);
    
    let queryParam = new McsPlannedWorkQueryParams();
    queryParam.category = this._category ?? "currentfuture";
    queryParam.affectedPlatform = this._affectedPlatform ?? null;

    return this._reportingService.getPlannedWorks(queryParam).pipe(
      map((response) => {
        let dataSourceContext = new McsMatTableContext(response, response?.length);
        this.dataChange.emit(dataSourceContext.dataRecords);
        return dataSourceContext;
      }),
      catchError((error) => {
        this.dataChange.emit([]);
        return throwError(error);
      })
    );
  }
}