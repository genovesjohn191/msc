import {
  Directive,
  ContentChild
} from '@angular/core';
/** Directives */
import { ListHeaderDefDirective } from '../list-header';
import { ListItemDefDirective } from '../list-item';

@Directive({
  selector: '[mcsListDef]'
})

export class ListDefDirective {

  @ContentChild(ListHeaderDefDirective)
  public listHeaderDefinition: ListHeaderDefDirective;

  @ContentChild(ListItemDefDirective)
  public listItemDefinition: ListItemDefDirective;
}
