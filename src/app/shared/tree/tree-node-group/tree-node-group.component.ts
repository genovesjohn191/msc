import {
  Component,
  ChangeDetectorRef,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  Input,
  ContentChild,
  NgZone,
  QueryList,
  AfterContentInit,
  ContentChildren
} from '@angular/core';
import {
  defer,
  merge,
  Observable,
  Subject
} from 'rxjs';
import {
  take,
  switchMap,
  takeUntil,
  startWith
} from 'rxjs/operators';
import {
  isNullOrEmpty,
  animateFactory,
  coerceBoolean,
  CommonDefinition
} from '@app/utilities';
import { TreeNodeGroupLabelDirective } from './tree-node-group-label.directive';
import { TreeNodeComponent } from '../tree-node/tree-node.component';

@Component({
  selector: 'mcs-tree-node-group',
  templateUrl: './tree-node-group.component.html',
  styleUrls: ['./tree-node-group.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.rotate45,
    animateFactory.expansionVertical
  ],
  host: {
    'class': 'tree-node-group-wrapper',
    '[class.tree-node-group-checkable]': 'checkable'
  }
})

export class TreeNodeGroupComponent<T> implements AfterContentInit {
  public panelOpen: boolean;

  @ContentChild(TreeNodeGroupLabelDirective)
  public labelTemplate: TreeNodeGroupLabelDirective;

  @ContentChildren(TreeNodeComponent)
  public treeNodes: QueryList<TreeNodeComponent<T>>;

  @Input()
  public label: string;

  @Input()
  public get checkable(): boolean { return this._checkable; }
  public set checkable(value: boolean) {
    if (this._checkable !== value) {
      this._checkable = coerceBoolean(value);
      this._setTreeNodeCheckableState();
    }
  }
  private _checkable: boolean;

  private _destroySubject = new Subject<void>();

  /**
   * Returns all tree nodes selections change as observables
   */
  private readonly _treeNodesSelectionChanges: Observable<TreeNodeComponent<T>> = defer(() => {
    if (!isNullOrEmpty(this.treeNodes)) {
      return merge<TreeNodeComponent<T>>(
        ...this.treeNodes.map((treeNode) => treeNode.selectionChange)
      );
    }
    return this._ngZone.onStable.asObservable().pipe(
      take(1),
      switchMap(() => this._treeNodesSelectionChanges)
    );
  });

  constructor(
    private _ngZone: NgZone,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  public ngAfterContentInit() {
    this._subscribeToTreeNodesChanges();
    this._subscribeToTreeNodesSelection();
  }

  /**
   * Returns the caret icon key
   */
  public get caretRightIconKey(): string {
    return CommonDefinition.ASSETS_FONT_CARET_RIGHT;
  }

  /**
   * Event that emits when the checkbox has been checked
   * @param event Event parameter
   */
  public onTickCheckbox(event: any): void {
    this.treeNodes.forEach((treeNode) => {
      event.checked ? treeNode.select() : treeNode.deselect();
    });
  }

  /**
   * Toggles the panel
   */
  public togglePanel(): void {
    this.panelOpen ? this.closePanel() : this.openPanel();
  }

  /**
   * Closes the currently opened panel
   */
  public closePanel(): void {
    this.panelOpen = false;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Opens the currently closed panel
   */
  public openPanel(): void {
    this.panelOpen = true;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Returns true if all nodes are selected
   */
  public get allNodesAreSelected(): boolean {
    if (isNullOrEmpty(this.treeNodes)) { return false; }
    return !(!!this.treeNodes.find((item) => !item.selected));
  }

  /**
   * Returns true when some of the tree nodes are selected
   */
  public get hasSelectedNode(): boolean {
    if (isNullOrEmpty(this.treeNodes)) { return false; }
    return !!this.treeNodes.find((item) => item.selected);
  }

  /**
   * Subscribes to tree node changes
   */
  private _subscribeToTreeNodesChanges(): void {
    this.treeNodes.changes.pipe(
      startWith(null),
      takeUntil(this._destroySubject)
    ).subscribe(() => {
      this._setTreeNodeCheckableState();
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Subscribes to tree node selection change event
   */
  private _subscribeToTreeNodesSelection(): void {
    this._treeNodesSelectionChanges.pipe(
      startWith(null),
      takeUntil(this._destroySubject)
    ).subscribe(() => {
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Sets the checkable flag state of the tree node
   */
  private _setTreeNodeCheckableState(): void {
    if (isNullOrEmpty(this.treeNodes)) { return; }
    this.treeNodes.forEach((treeNode) => {
      this.checkable ? treeNode.enableCheck() : treeNode.disableCheck();
    });
  }
}
