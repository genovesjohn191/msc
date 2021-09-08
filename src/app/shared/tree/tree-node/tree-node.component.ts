import {
  Component,
  ChangeDetectorRef,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  AfterViewInit,
  Input,
  EventEmitter,
  ElementRef
} from '@angular/core';
import { McsUniqueId } from '@app/core';
import { animateFactory } from '@app/utilities';
import { TreeNode } from './tree-node';

@Component({
  selector: 'mcs-tree-node',
  templateUrl: './tree-node.component.html',
  styleUrls: ['./tree-node.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.expansionVertical
  ],
  host: {
    'class': 'tree-node-wrapper',
    '[class.tree-node-selected]': 'selected',
    '[class.tree-node-checkable]': 'checkable',
    '[attr.id]': 'id'
  }
})

export class TreeNodeComponent<T> implements AfterViewInit, TreeNode<T> {
  public selectionChange = new EventEmitter<TreeNodeComponent<T>>();

  @Input()
  public id: string = McsUniqueId.NewId('tree-node');

  @Input()
  public value: any;
  public get label(): string {
    return (this._elementRef.nativeElement.textContent || '').trim();
  }

  @Input()
  public get selected(): boolean { return this._selected; }
  public set selected(value: boolean) {
    if (this._selected !== value) {
      this._selected = value;
      this.selectionChange.next(this);
      this._changeDetectorRef.markForCheck();
    }
  }
  private _selected: boolean;

  @Input()
  public checkable: boolean;

  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  public ngAfterViewInit() {
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event that emits when the checkbox was clicked
   * @param event Event parameters
   */
  public onTickCheckbox(event: any): void {
    event.checked ? this.select() : this.deselect();
  }

  /**
   * Enable the checkbox of the tree node
   */
  public enableCheck(): void {
    this.checkable = true;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Disables the checkbox of the tree node
   */
  public disableCheck(): void {
    this.checkable = false;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Selects the tree-node and notify the changes to the tree
   */
  public select(): void {
    this.selected = true;
  }

  /**
   * Deselects the tree-node and notify the changes to the tree
   */
  public deselect(): void {
    this.selected = false;
  }
}
