import {
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
import {
  animateFactory,
  isNullOrEmpty,
  registerEvent,
  unregisterEvent,
  unsubscribeSafely,
  KeyboardKey,
  TreeDatasource,
  TreeItem
} from '@app/utilities';

import { FormFieldBaseComponent2 } from '../abstraction/form-field.base';
import { FieldSelectTreeSearch } from './field-select-tree-search';
import { IFieldSelectTreeView } from './field-select-tree-view';

interface MatTreeViewModel<TEntity> {
  expandable: boolean;
  level: number;
  selectable: boolean;

  name: string;
  data: TEntity;
  checkbox: FormControl
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
  implements IFieldSelectTreeView<TEntity>, OnInit, AfterViewInit, OnDestroy {

  @Input()
  public dataSource: TreeDatasource<TEntity>;

  @Input()
  public singleSelect: boolean;

  public panelOpen: boolean;
  public viewportHeight: string;
  public fcTreeSearch: FormControl;

  public readonly treeDatasource: MatTreeFlatDataSource<TreeItem<TEntity>, MatTreeViewModel<TEntity>>;
  public readonly treeControl: FlatTreeControl<MatTreeViewModel<TEntity>>;
  public readonly treeFlattener: MatTreeFlattener<TreeItem<TEntity>, MatTreeViewModel<TEntity>>;
  public readonly treeSearch: FieldSelectTreeSearch;

  private _clickOutsideHandler = this.onClickOutSide.bind(this);

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
    this.fcTreeSearch = new FormControl();

    this.registerCustomControls(this.fcTreeSearch);
  }

  public ngOnInit(): void {
    this.treeSearch
      .registerFormControl(this.fcTreeSearch)
      .startSubscription();
    this.dataSource.registerSearch(this.treeSearch);

    this._subscribeToDataSourceChange();
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

  public get treeViewLabel(): string {
    let selectedItems = this.ngControl?.control?.value as Array<any>;
    if (isNullOrEmpty(selectedItems)) { return this.displayedLabel; }

    let firstTreeFound = this.treeControl.dataNodes
      .find(dataNode => dataNode.data === this.ngControl?.control?.value[0]);

    return selectedItems.length > 1 ?
      `${firstTreeFound?.name} (+${selectedItems.length - 1} selected)` :
      firstTreeFound?.name;
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

    if (!node.selectable) { return; }
    this._selectItem(node);
  }

  public itemIsExpanded(node: MatTreeViewModel<TEntity>): boolean {
    return this.treeControl.isExpanded(node);
  }

  public itemIsInDeterminate(node: MatTreeViewModel<TEntity>): boolean {
    if (!node.expandable || this.singleSelect) { return false; }

    const descendants = this.treeControl.getDescendants(node) || [];
    const uncheckedItemFound = descendants.find(descendant => !descendant.checkbox?.value);
    if (uncheckedItemFound) {
      return descendants.some(descendant => descendant.checkbox?.value);
    }
    return false;
  }

  public itemIsChecked(node: MatTreeViewModel<TEntity>): boolean {
    if (node.expandable && !this.singleSelect) {
      const uncheckedItemFound = this.treeControl.getDescendants(node)
        .find(descendant => !descendant.expandable && !descendant.checkbox?.value);
      return !uncheckedItemFound;
    }
    return node.checkbox?.value;
  }

  private _selectItem(node: MatTreeViewModel<TEntity>): void {
    requestAnimationFrame(() => {
      // Change the current selection state of the formcontrols
      const currentValue = node.checkbox?.value;
      const nextValue = !currentValue;
      node.checkbox?.setValue(nextValue);

      // Select children elements of the tree
      const descendants = this.treeControl.getDescendants(node) || [];
      if (!isNullOrEmpty(descendants) && node.expandable) {
        descendants?.forEach(descendant => {
          descendant.checkbox.setValue(nextValue);
        });
      }

      // Update associated form control
      const allSelectedItems = this.treeControl.dataNodes
        ?.filter(dataNode => dataNode.checkbox?.value)
        ?.map(dataNode => dataNode.data);
      this.ngControl.control.setValue(allSelectedItems);

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
    Promise.resolve().then(() => {
      let maxDisplayNodes = Math.min(
        this._viewPortScroll?.getDataLength() || dataRecords?.length,
        maxItemsDisplay
      );

      this.viewportHeight = `${maxDisplayNodes * this.itemHeightInPx}px`;
      this._viewPortScroll?.checkViewportSize();
      this.changeDetectorRef.markForCheck();
    });
  }

  private _treeTransformerDef(
    treeItem: TreeItem<TEntity>,
    treeLevel: number
  ): MatTreeViewModel<TEntity> {
    return {
      expandable: !isNullOrEmpty(treeItem.children),
      level: treeLevel,
      selectable: treeItem.canSelect,
      name: treeItem.text,
      data: treeItem.value,
      checkbox: new FormControl(false)
    } as MatTreeViewModel<TEntity>;
  }

  private _subscribeToDataSourceChange(): void {
    this.dataSource.connect(null).pipe(
      takeUntil(this.destroySubject),
      tap(dataRecords => {
        this.treeDatasource.data = dataRecords;
        this._updateViewPortHeight(dataRecords);
      })
    ).subscribe();
  }
}