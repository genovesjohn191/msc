import {
  Directive,
  ContentChild
} from '@angular/core';
/** Directives */
import { ListPanelHeaderDefDirective } from '../list-panel-header';
import { ListPanelItemDefDirective } from '../list-panel-item';

@Directive({
  selector: '[mcsListPanelDef]'
})

export class ListPanelDefDirective {

  @ContentChild(ListPanelHeaderDefDirective)
  public listHeaderDefinition: ListPanelHeaderDefDirective;

  @ContentChild(ListPanelItemDefDirective)
  public listItemDefinition: ListPanelItemDefDirective;
}
