import {
  Component,
  ViewChild
} from '@angular/core';
import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';
import { CoreTestingModule } from '@app/core/testing';

import { TreeNode } from './tree-node/tree-node';
import { TreeComponent } from './tree.component';
import { TreeModule } from './tree.module';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild(TreeComponent)
  public component: TreeComponent<any>;
  public selectedNodes: Array<TreeNode<any>>;

  public treeChange(_selectedNodes: Array<TreeNode<any>>): void {
    this.selectedNodes = _selectedNodes;
  }
}

describe('TreeComponent', () => {

  /** Stub Services/Components */
  let testComponent: TestComponent;

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestComponent
      ],
      imports: [
        CoreTestingModule,
        TreeModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
          <mcs-tree (selectionChange)="treeChange($event)">
            <mcs-tree-node-group label="All Updates">
              <mcs-tree-node>
                <a>KB971033</a>
              </mcs-tree-node>

              <mcs-tree-node>
                <a>KB971034</a>
              </mcs-tree-node>

              <mcs-tree-node>
                <a>KB971035</a>
              </mcs-tree-node>
            </mcs-tree-node-group>
          </mcs-tree>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      testComponent = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the mcs-tree element`, () => {
      let element = document.querySelector('mcs-tree');
      expect(element).not.toBe(null);
    });

    it(`should create 1 mcs-tree-node-group element`, () => {
      let element = document.querySelectorAll('mcs-tree-node-group');
      expect(element).not.toBe(null);
      expect(element.length).toEqual(1);
    });

    it(`should create 3 mcs-tree-node element`, () => {
      let element = document.querySelectorAll('mcs-tree-node');
      expect(element.length).toEqual(3);
    });
  });

  describe('selectionChange()', () => {
    it(`should have 3 tree nodes`, () => {
      expect(testComponent.component.treeNodes.length).toEqual(3);
    });

    it(`should select the first node`, () => {
      testComponent.component.treeNodes.first.select();

      let firstNode = 'KB971033';
      let treeNodeFound = testComponent.selectedNodes
        .find((treeNode) => firstNode === treeNode.label);
      expect(treeNodeFound).toBeDefined();
    });
  });
});
