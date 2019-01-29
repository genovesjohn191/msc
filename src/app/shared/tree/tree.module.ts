import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from '../checkbox/checkbox.module';
import { OptionGroupModule } from '../option-group/option-group.module';
import { ButtonModule } from '../button/button.module';

import { TreeComponent } from './tree.component';
import { TreeNodeGroupComponent } from './tree-node-group/tree-node-group.component';
import { TreeNodeGroupLabelDirective } from './tree-node-group/tree-node-group-label.directive';
import { TreeNodeComponent } from './tree-node/tree-node.component';

@NgModule({
  declarations: [
    TreeComponent,
    TreeNodeGroupComponent,
    TreeNodeGroupLabelDirective,
    TreeNodeComponent
  ],
  imports: [
    CommonModule,
    CheckboxModule,
    OptionGroupModule,
    ButtonModule
  ],
  exports: [
    CommonModule,
    CheckboxModule,
    OptionGroupModule,
    ButtonModule,

    TreeComponent,
    TreeNodeGroupComponent,
    TreeNodeGroupLabelDirective,
    TreeNodeComponent
  ]
})

export class TreeModule { }
