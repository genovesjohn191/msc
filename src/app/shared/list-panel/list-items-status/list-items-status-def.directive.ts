import {
  Directive,
  ContentChild
} from '@angular/core';
/** Directives */
import { ListItemsEmptyDefDirective } from './list-items-empty/list-items-empty-def.directive';
import { ListItemsErrorDefDirective } from './list-items-error/list-items-error-def.directive';

@Directive({
  selector: '[mcsListItemsStatusDef]'
})

export class ListItemsStatusDefDirective {

  @ContentChild(ListItemsEmptyDefDirective)
  public listItemsEmptyDef: ListItemsEmptyDefDirective;

  @ContentChild(ListItemsErrorDefDirective)
  public listItemsErrorDef: ListItemsErrorDefDirective;
}
