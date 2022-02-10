import {
  defer,
  merge,
  Observable,
  Subject
} from 'rxjs';
import {
  switchMap,
  take,
  takeUntil
} from 'rxjs/operators';

import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  NgZone,
  OnDestroy,
  Output,
  QueryList,
  ViewEncapsulation
} from '@angular/core';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';

import { TreeNode } from './tree-node/tree-node';
import { TreeNodeComponent } from './tree-node/tree-node.component';

@Component({
  selector: 'mcs-tree',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./tree.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'tree-wrapper'
  }
})

export class TreeComponent<T> implements AfterContentInit, OnDestroy {
  @Output()
  public selectionChange = new EventEmitter<Array<TreeNode<T>>>();

  @ContentChildren(TreeNodeComponent, { descendants: true })
  public treeNodes: QueryList<TreeNodeComponent<T>>;

  private _destroySubject = new Subject<void>();

  /**
   * Returns all tree nodes selections change as observables
   */
  private readonly _treeNodesSelectionChanges: Observable<TreeNodeComponent<T>> = defer(() => {
    if (!isNullOrEmpty(this.treeNodes)) {
      return merge(
        ...this.treeNodes.map((treeNode) => treeNode.selectionChange)
      );
    }
    return this._ngZone.onStable.asObservable().pipe(
      take(1),
      switchMap(() => this._treeNodesSelectionChanges)
    );
  });

  constructor(private _ngZone: NgZone) { }

  public ngAfterContentInit() {
    Promise.resolve().then(() => {
      this._subscribeToTreeNodesSelection();
    });
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * Subscribes to tree node selection change and notify the changes to outside components
   */
  private _subscribeToTreeNodesSelection(): void {
    this._treeNodesSelectionChanges.pipe(
      takeUntil(this._destroySubject)
    ).subscribe(() => this._notifyChanges());
  }

  /**
   * Notify the changes on the selection
   */
  private _notifyChanges(): void {
    if (isNullOrEmpty(this.treeNodes)) { return; }
    let treeNodes = new Array<TreeNode<T>>();
    treeNodes = this.treeNodes.filter((treeNode) => treeNode.selected)
      .map((item) => {
        return {
          id: item.id,
          label: item.label,
          value: item.value
        } as TreeNode<T>;
      });
    this.selectionChange.next(treeNodes);
  }
}
