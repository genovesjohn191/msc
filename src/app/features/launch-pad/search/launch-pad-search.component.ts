import {
  OnDestroy,
  ViewChild
} from '@angular/core';
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import { McsFilterInfo } from '@app/models';
import { ColumnFilter } from '@app/shared';
import {
  createObject,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'mcs-launch-pad-search',
  templateUrl: './launch-pad-search.component.html',
  styleUrls: ['./launch-pad-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaunchPadSearchComponent implements OnInit, OnDestroy {
  public readonly defaultCrispElementsColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'orderId' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'productId' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'serviceId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'description' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'status' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'companyName' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'companyId' })
  ];

  public readonly defaultInstalledServicesColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'productId' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'serviceId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'description' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'companyName' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'companyId' })
  ];

  @ViewChild('crispElementsColumnFilter')
  public set crispElementsColumnFilter(value: ColumnFilter) {
    if (!isNullOrEmpty(value) && isNullOrEmpty(this.elementsTableFilters)) {
      this.elementsTableFilters = value;
    }
  }

  @ViewChild('installedServicesColumnFilter')
  public set installedServicesColumnFilter(value: ColumnFilter) {
    if (!isNullOrEmpty(value) && isNullOrEmpty(this.servicesTableFilters)) {
      this.servicesTableFilters = value;
    }
  }

  public elementsTableFilters: ColumnFilter;
  public servicesTableFilters: ColumnFilter;
  public keyword: string = '';
  public selectedTabIndex: number = 0;

  private _destroySubject = new Subject<void>();

  public constructor(
    private _activatedRoute: ActivatedRoute) {
  }

  public ngOnInit(): void {
    this.getRouterParams();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  private getRouterParams(): void {
    this._activatedRoute.paramMap.pipe(
      takeUntil(this._destroySubject),
      tap((params: ParamMap) => {
        let keyword = params.get('keyword');
        if (isNullOrEmpty(keyword)) { return; }

        this.keyword = keyword;
      })
    ).subscribe();
  }
}
