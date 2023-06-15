import {
  defer,
  merge,
  Observable,
  Subject
} from 'rxjs';
import {
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  Input,
  IterableChangeRecord,
  IterableDiffer,
  IterableDiffers,
  OnDestroy,
  QueryList,
  TrackByFunction,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { DataStatus } from '@app/models';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  McsDataSource
} from '@app/utilities';

import { OptionGroupComponent } from '../option-group/option-group.component';
import { OptionComponent } from '../option-group/option/option.component';
import { ListPanelContentDirective } from './list-content/list-panel-content.directive';
import { ListPanelContentOutletDirective } from './list-content/list-panel-content.outlet';
import { ListPanelConfig } from './list-panel.config';

@Component({
  selector: 'mcs-list-panel',
  templateUrl: './list-panel.component.html',
  styleUrls: ['./list-panel.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'list-panel-wrapper'
  }
})

export class ListPanelComponent<TEntity> implements AfterContentInit, OnDestroy {

  public dataStatusChange: Observable<DataStatus>;

  @Input()
  public set dataSource(value: McsDataSource<TEntity>) {
    if (this._dataSource !== value) {
      this._switchDatasource(value);
    }
  }
  private _dataSource: McsDataSource<TEntity>;
  private _dataSourceChange = new Subject<void>();

  @Input()
  public config: ListPanelConfig;

  @Input()
  public set trackBy(fn: TrackByFunction<TEntity>) { this._trackBy = fn; }
  public get trackBy(): TrackByFunction<TEntity> { return this._trackBy; }
  private _trackBy: TrackByFunction<TEntity>;

  @ViewChild(ListPanelContentOutletDirective)
  private _listPanelOutlet: ListPanelContentOutletDirective;

  @ContentChild(ListPanelContentDirective)
  private _listPanelContent: ListPanelContentDirective;

  @ContentChildren(OptionGroupComponent, { descendants: true })
  private _optionGroups: QueryList<OptionGroupComponent>;

  @ContentChildren(OptionComponent, { descendants: true })
  private _options: QueryList<OptionComponent>;

  private _destroySubject = new Subject<void>();
  private _dataDiffer: IterableDiffer<TEntity>;
  private _savedActiveGroupId: string;

  /**
   * Combine streams of all option click change
   */
  private readonly _optionsClickEvents: Observable<OptionComponent> = defer(() => {
    return merge(...this._options.map((option) => option.clickChange));
  });

  constructor(
    differs: IterableDiffers,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this._dataDiffer = differs.find([]).create(this._trackBy);
  }

  public ngAfterContentInit(): void {
    Promise.resolve().then(() => {
      this._options.changes.pipe(
        takeUntil(this._destroySubject),
        tap(() => this._subscribesToOptionsClickEvent())
      ).subscribe();

      this._validateListPanelContent();
      this._subscribeToDatasource();
    });
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public get dataStatusEnum(): any {
    return DataStatus;
  }

  /**
   * Subscribes to all the options click events
   */
  private _subscribesToOptionsClickEvent(): void {
    let resetSubject = merge(this._options.changes, this._destroySubject);

    this._optionsClickEvents.pipe(
      takeUntil(resetSubject)
    ).subscribe((option: OptionComponent) => {
      this._selectSingleOption(option);
      this._closeOptionGroupsPanel();
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Selects single option based on the input provided
   * @param option Option to be selected
   */
  private _selectSingleOption(option: OptionComponent): void {
    if (isNullOrEmpty(option)) { return; }

    this._clearSelectedOptions();
    option.select();
  }

  /**
   * Clears all selected options
   */
  private _clearSelectedOptions(): void {
    this._options.forEach((option) => option.deselect());
  }

  /**
   * Close all the option groups without option selected/active
   */
  private _closeOptionGroupsPanel(all?: boolean): void {
    if (isNullOrEmpty(this._optionGroups)) { return; }

    this._optionGroups.forEach((optionGroup) => {
      if (all) {
        optionGroup.closePanel();
        return;
      }

      if (!optionGroup.hasSelectedOption) {
        optionGroup.closePanel();
      }
    });
  }

  private _switchDatasource(newDatasource: McsDataSource<TEntity>) {
    if (isNullOrEmpty(newDatasource)) { return; }
    this._dataSource = newDatasource;
    this._dataSourceChange.next();
    this._subscribeToDataStatus();
  }

  private _subscribeToDatasource(): void {
    if (isNullOrEmpty(this._dataSource)) {
      throw new Error(`Unable to render the list panel without datasource.`);
    }

    this._dataSource.connect(null).pipe(
      takeUntil(this._destroySubject),
      tap((entities) => {
        this._renderListPanelContent(entities as TEntity[]);

        setTimeout(() => {
          this._updateOptionGroupExpandableStatus();
        }, 300);
      })
    ).subscribe();
  }

  private _renderListPanelContent(entities: TEntity[]): void {
    let dataChanges = this._dataDiffer.diff(entities);
    if (!dataChanges) { return; }

    let dataViewContainer = this._listPanelOutlet.viewContainer;
    dataChanges.forEachOperation((
      item: IterableChangeRecord<any>,
      adjustedPreviousIndex: number,
      currentIndex: number
    ) => {
      if (item.previousIndex == null) {
        let context = { $implicit: entities[currentIndex] };
        this._listPanelOutlet.viewContainer.createEmbeddedView(
          this._listPanelContent.templateRef, context, currentIndex
        );
      } else if (currentIndex == null) {
        dataViewContainer.remove(adjustedPreviousIndex);
      } else {
        const view = dataViewContainer.get(adjustedPreviousIndex);
        dataViewContainer.move(view, currentIndex);
      }
    });
  }

  private _subscribeToDataStatus(): void {
    this.dataStatusChange = this._dataSource.dataStatusChange().pipe(
      takeUntil(this._dataSourceChange),
      shareReplay(1)
    );
  }

  private _validateListPanelContent(): void {
    if (isNullOrEmpty(this._listPanelContent)) {
      throw new Error(`List panel content is not defined. Please make sure the template is bind correctly.`);
    }
  }

  private _updateOptionGroupExpandableStatus(): void {
    if (this._dataSource.isSearching()) {
      this._savedActiveGroupId = this._optionGroups.find(og => og.panelOpen)?.id;
      this._optionGroups.forEach(og => {
        og.openPanel();
      });

    } else if (!isNullOrEmpty(this._savedActiveGroupId)) {
      let foundGroup = this._optionGroups.find(og => og.id === this._savedActiveGroupId);
      if (!isNullOrEmpty(foundGroup)) {
        foundGroup.openPanel();
      }
    }
  }
}
