import {
  throwError,
  BehaviorSubject,
  Observable
} from 'rxjs';
import {
  catchError,
  map,
  shareReplay,
  startWith,
  takeUntil,
  tap
} from 'rxjs/operators';

import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { FlatTreeControl } from '@angular/cdk/tree';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import {
  MatTreeFlattener,
  MatTreeFlatDataSource
} from '@angular/material/tree';
import { DataStatus } from '@app/models';
import {
  animateFactory,
  isArray,
  isNullOrEmpty,
  refreshView,
  registerEvent,
  unregisterEvent,
  unsubscribeSafely,
  KeyboardKey,
  TreeDatasource,
  TreeItem
} from '@app/utilities';

import { IFormFieldCustomizable } from '../abstraction/form-field-customizable.interface';
import { FormFieldBaseComponent2 } from '../abstraction/form-field.base';
import { FieldSelectTreeSearch } from './field-select-tree-search';
import { IFieldSelectTreeView } from './field-select-tree-view';

interface MatTreeViewModel<TEntity> {
  expandable: boolean;
  level: number;
  selectable: boolean;
  excludeFromSelection: boolean;
  disableWhen: (entity: TEntity) => boolean;

  name: string;
  tooltip: string;
  tooltipFunc: (entity: TEntity) => string;

  data: TEntity;
  checkbox: FormControl<boolean>
}

const TREE_ITEM_HEIGHT = 32;
const TREE_ITEM_MAX_DISPLAY = 10;

@Component({
  selector: 'mcs-field-select-tree-view',
  templateUrl: './field-select-tree-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.rotate45
  ],
  host: {
    'class': 'field-select-tree-view'
  }
})
export class FieldSelectTreeViewComponent<TEntity>
  extends FormFieldBaseComponent2<string>
  implements IFieldSelectTreeView<TEntity>, OnInit, AfterViewInit, OnDestroy, IFormFieldCustomizable {

  @Input()
  public multiple: boolean;

  @Input()
  public alwaysShowPanel: boolean;

  @Input()
  public expandFirst: boolean;

  @Input()
  public dataSource: TreeDatasource<TEntity>;

  @Input()
  public disabled: boolean = false;

  @Input()
  public hideChips: boolean = false;

  @Input()
  public selectAllByDefault: boolean = false;

  @Input()
  public noRecordsFoundText: string;

  @Input()
  public noDisplayOnNoRecords: boolean = false;

  @Input()
  public autoClearSelection: boolean = true;

  public selectedNodes$: Observable<MatTreeViewModel<TEntity>[]>;
  public panelOpen: boolean;
  public viewportHeight: string;
  public fcTreeSearch: FormControl<string>;
  public processOnGoing$: Observable<boolean>;

  public readonly treeDatasource: MatTreeFlatDataSource<TreeItem<TEntity>, MatTreeViewModel<TEntity>>;
  public readonly treeControl: FlatTreeControl<MatTreeViewModel<TEntity>>;
  public readonly treeFlattener: MatTreeFlattener<TreeItem<TEntity>, MatTreeViewModel<TEntity>>;
  public readonly treeSearch: FieldSelectTreeSearch;

  private _clickOutsideHandler = this.onClickOutSide.bind(this);
  private _selectedNodesChange = new BehaviorSubject<MatTreeViewModel<TEntity>[]>([]);

  @ViewChild('viewOverlayTrigger', { read: CdkOverlayOrigin })
  private _viewOverlayTrigger: CdkOverlayOrigin;

  @ViewChild('viewPortScroll', { read: CdkVirtualScrollViewport })
  private _viewPortScroll: CdkVirtualScrollViewport;

  @ViewChild('viewFormField', { read: MatFormField })
  private _viewFormField: MatFormField;

  constructor(
    _injector: Injector,
    private _elementRef: ElementRef<HTMLElement>
  ) {
    super(_injector);

    this.treeControl = new FlatTreeControl<MatTreeViewModel<TEntity>>(
      node => node.level, node => node.expandable
    );
    this.treeFlattener = new MatTreeFlattener(
      this._treeTransformerDef, node => node.level,
      node => node.expandable, treeItem => treeItem.children
    );
    this.treeDatasource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.treeSearch = new FieldSelectTreeSearch();
    this.fcTreeSearch = new FormControl<string>(null);

    this.registerCustomControls(this.fcTreeSearch);
  }

  public get noItemsText(): string {
    return this.noRecordsFoundText || this.translate.instant('message.noRecordsFound');
  }

  public ngOnInit(): void {
    this.treeSearch
      .registerFormControl(this.fcTreeSearch)
      .startSubscription();
    this.dataSource.registerSearch(this.treeSearch);

    this._subscribeToDataStatusChange();
    this._subscribeToDataSourceChange();

    this.updateValidators();
    this.subscribeToFormValueChange();
    this.propagateFormValueChange();
  }

  public ngAfterViewInit(): void {
    Promise.resolve().then(() => {
      registerEvent(document, 'click', this._clickOutsideHandler);
    });
  }

  public ngOnDestroy(): void {
    unregisterEvent(document, 'click', this._clickOutsideHandler);
    unsubscribeSafely(this.destroySubject);
    this.dataSource?.disconnect(null);
    this.treeSearch.stopSubscription();
  }

  public trackByIndex(index: number, node: MatTreeViewModel<TEntity>): number {
    return index;
  }

  public get treeViewLabel(): string {
    let selectedNodes = this._selectedNodesChange.getValue();
    if (isNullOrEmpty(selectedNodes)) { return this.displayedLabel; }

    return selectedNodes?.length > 1 ?
      `${selectedNodes[0]?.name} (+${selectedNodes.length - 1} selected)` :
      selectedNodes[0].name;
  }

  public get itemHeightInPx(): number {
    return TREE_ITEM_HEIGHT;
  }

  public get itemWidthInPx(): number {
    return this._viewFormField?._elementRef
      ?.nativeElement
      .getBoundingClientRect()
      .width;
  }

  public onBlurInput(): void {
    // this._closePanel();
    // TODO(apascual): See if we need to mark as touched the form here
  }

  public onTogglePanel(): void {
    this.panelOpen ? this._closePanel() : this._openPanel();
  }

  public onToggleNode(event: MouseEvent, node: MatTreeViewModel<TEntity>): void {
    event?.stopPropagation();
    this.treeControl.toggle(node);
    this._updateViewPortHeight(this.treeDatasource?.data);
  }

  public onKeyDown(event: KeyboardEvent): void {
    // Close when escape key is pressed
    if (event.keyboardKey() === KeyboardKey.Escape) {
      event?.stopPropagation();
      this._closePanel();
    }
  }

  public onClickOutSide(_event: any): void {
    if (this._elementRef.nativeElement.contains(_event.target)) { return; }
    this._closePanel();
  }

  public onClickItem(event: MouseEvent, node: MatTreeViewModel<TEntity>): void {
    event?.stopPropagation();

    if (!node.selectable || (node.disableWhen && node.disableWhen(node.data))) { return; }

    this._toggleItem(node);
    if (!this.multiple) { this._closePanel(); }
  }

  public itemIsExpanded(node: MatTreeViewModel<TEntity>): boolean {
    return this.treeControl.isExpanded(node);
  }

  public itemIsInDeterminate(node: MatTreeViewModel<TEntity>): boolean {
    if (!node.expandable || !this.multiple) { return false; }

    const descendants = this.treeControl.getDescendants(node) || [];
    const uncheckedItemFound = descendants?.find(descendant => !descendant.checkbox?.value);
    if (uncheckedItemFound) {
      return descendants?.some(descendant => descendant.checkbox?.value);
    }
    return false;
  }

  public itemIsChecked(node: MatTreeViewModel<TEntity>): boolean {
    if (node.expandable && this.multiple) {
      const uncheckedItemFound = this.treeControl.getDescendants(node)
        .find(descendant => !descendant.expandable && !descendant.checkbox?.value);
      return !uncheckedItemFound;
    }
    return node.checkbox?.value;
  }

  public updateValidators(): void {
    // Noop if we just need to update custom validators.
  }

  public updateView(): void {
    this.changeDetectorRef.markForCheck();
  }

  public subscribeToFormValueChange(): void {
    this.ngControl?.control.valueChanges.pipe(
      startWith(this.ngControl?.control?.value),
      takeUntil(this.destroySubject),
      tap(formValues => {
        // Notify when no value provided (in case of reset)
        if (isNullOrEmpty(formValues) && this.autoClearSelection) {
          this._clearSelection();
          return;
        }

        let selectedNodes = new Array<MatTreeViewModel<TEntity>>();
        let formValueArray = isArray(formValues) ?
          formValues : [formValues];

        (formValueArray as Array<any>)?.forEach(formValue => {
          let nodeFound = this.treeControl.dataNodes
            .find(dataNode => dataNode.data === formValue);
          if (isNullOrEmpty(nodeFound)) { return; }
          if (nodeFound.checkbox?.value === false) {
            nodeFound.checkbox.setValue(true);
            this.changeDetectorRef.markForCheck();
          }
          selectedNodes.push(nodeFound);
        });

        this._selectedNodesChange.next(selectedNodes)
      })
    ).subscribe();
  }

  public propagateFormValueChange(): void {
    this.selectedNodes$ = this._selectedNodesChange.pipe(
      tap(selectedNodes => {
        // Notify changes to form control
        let dataRecords = selectedNodes?.map(selectedNode => selectedNode.data as any);
        this.propagateFormControlChanges(dataRecords, this.multiple);
      })
    );
  }

  private _toggleItem(node: MatTreeViewModel<TEntity>): void {
    requestAnimationFrame(() => {
      // In case of single selection, we need to clear all selected first
      if (!this.multiple) {
        this._clearDataNodesSelection();
      }

      // Change the current selection state of the formcontrols
      const currentValue = node.checkbox?.value;
      const nextValue = !currentValue;
      node.checkbox?.setValue(nextValue);
      node.checkbox.markAsTouched();

      // Select children elements of the tree
      if (this.multiple) {
        const descendants = this.treeControl.getDescendants(node) || [];
        if (!isNullOrEmpty(descendants) && node.expandable) {
          descendants?.forEach(descendant => {
            descendant.checkbox.setValue(nextValue);
            descendant.checkbox.markAsTouched();
          });
        }
      }

      // Update associated form control
      const selectedNodes = this.treeControl.dataNodes
        ?.filter(dataNode => dataNode.checkbox?.value &&
          !dataNode.excludeFromSelection);
      this._selectedNodesChange.next(selectedNodes);
      this.changeDetectorRef.markForCheck();
    });
  }

  private _openPanel(): void {
    this.panelOpen = true;
    this.changeDetectorRef.markForCheck();
  }

  private _closePanel(): void {
    this.panelOpen = false;
    this.changeDetectorRef.markForCheck();
  }

  private _updateViewPortHeight(dataRecords: TreeItem<TEntity>[]): void {
    const maxItemsDisplay = TREE_ITEM_MAX_DISPLAY;

    // We need to update the viewportsize dynamically based
    // on the records expanded
    let maxItemsRendered = 0;
    dataRecords.forEach(dataRecord => {
      ++maxItemsRendered;
      maxItemsRendered += dataRecord.children?.length;
    });

    refreshView(() => {
      let maxDisplayNodes = Math.min(
        maxItemsRendered || this._viewPortScroll?.getRenderedRange()?.end || this.treeControl?.dataNodes?.length,
        maxItemsDisplay
      );

      this.viewportHeight = `${maxDisplayNodes * this.itemHeightInPx}px`;
      this._viewPortScroll?.checkViewportSize();
      this.changeDetectorRef.markForCheck();
    });
  }

  private _initializeRecordsDisplay(dataRecords: TreeItem<TEntity>[]): void {
    let needsToUpdateDisplay = this.expandFirst || this.selectAllByDefault;
    if (isNullOrEmpty(dataRecords) || !needsToUpdateDisplay) { return; }

    refreshView(() => {
      dataRecords.forEach(dataRecord => {
        let dataFound = this.treeControl.dataNodes
          ?.find(dataNode => dataNode.data === dataRecord.value);
        if (isNullOrEmpty(dataFound)) { return; }

        // Expand the expandable items initially
        if (this.expandFirst && dataFound?.expandable) {
          this.treeControl.expand(dataFound);
        }

        // Toggle the items
        if (this.selectAllByDefault) {
          this._toggleItem(dataFound);
        }
      });
    });
  }

  private _treeTransformerDef(
    treeItem: TreeItem<TEntity>,
    treeLevel: number
  ): MatTreeViewModel<TEntity> {
    return {
      expandable: !isNullOrEmpty(treeItem.children),
      level: treeLevel,
      name: treeItem.text,
      data: treeItem.value,
      checkbox: new FormControl<boolean>(false),
      selectable: treeItem.option?.selectable,
      excludeFromSelection: treeItem.option?.excludeFromSelection,
      disableWhen: treeItem.option?.disableWhen,
      tooltipFunc: treeItem.option?.tooltipFunc
    } as MatTreeViewModel<TEntity>;
  }

  private _subscribeToDataSourceChange(): void {
    this.dataSource.connect(null).pipe(
      takeUntil(this.destroySubject),
      tap(dataRecords => {
        this.treeDatasource.data = dataRecords;
        this._initializeRecordsDisplay(dataRecords);

        this.changeDetectorRef.markForCheck();
        this._updateViewPortHeight(dataRecords);
      }),
      catchError(error => {
        return throwError(() => new Error(error));
      })
    ).subscribe();
  }

  private _subscribeToDataStatusChange(): void {
    this.processOnGoing$ = this.dataSource.dataStatusChange().pipe(
      takeUntil(this.destroySubject),
      map(status => status === DataStatus.PreActive || status === DataStatus.Active),
      shareReplay(1)
    );
  }

  private _clearSelection(): void {
    refreshView(() => {
      this._clearDataNodesSelection();
      this._selectedNodesChange.next([]);
    });
  }

  private _clearDataNodesSelection(): void {
    this.treeControl?.dataNodes?.forEach(dataNode => {
      if (!dataNode?.checkbox?.value) { return; }
      dataNode?.checkbox.setValue(false);
    });
  }
}