import { OnDestroy } from '@angular/core';
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { McsFilterService } from '@app/core';
import { McsFilterInfo } from '@app/models';
import { CommonDefinition, isNullOrEmpty, unsubscribeSafely } from '@app/utilities';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { LaunchPadContextSource } from '../core';

@Component({
  selector: 'mcs-launch-pad-search',
  templateUrl: './launch-pad-search.component.html',
  styleUrls: ['./launch-pad-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaunchPadSearchComponent implements OnInit, OnDestroy {
  public elementsTableFilters: McsFilterInfo[];
  public servicesTableFilters: McsFilterInfo[];
  public keyword: string = '';
  public selectedTabIndex: number = 0;

  private _destroySubject = new Subject<void>();

  public constructor(
    private _activatedRoute: ActivatedRoute,
    private _filterService: McsFilterService) {
    this._initializeDataColumns();
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

  public onColumnFilterChange(table: LaunchPadContextSource, updatedFilters: McsFilterInfo[]): void {
    if (isNullOrEmpty(updatedFilters)) { return; }

    switch(table) {
      case 'crisp-elements': {
        this.elementsTableFilters = updatedFilters.filter(() => true);
        break;
      }
      case 'installed-services': {
        this.servicesTableFilters = updatedFilters.filter(() => true);
        break;
      }
    }
  }

  public _initializeDataColumns(): void {
    this.elementsTableFilters = this._filterService.getFilterSettings(CommonDefinition.FILTERSELECTOR_LAUNCH_PAD_SEARCH_ELEMENTS_LISTING);
    this.servicesTableFilters = this._filterService.getFilterSettings(CommonDefinition.FILTERSELECTOR_LAUNCH_PAD_SEARCH_SERVICES_LISTING);
  }
}
