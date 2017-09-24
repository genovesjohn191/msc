import {
  Directive,
  ContentChild
} from '@angular/core';
/** Directives */
import { DataEmptyDefDirective } from './data-empty/data-empty-def.directive';
import { DataErrorDefDirective } from './data-error/data-error-def.directive';

@Directive({
  selector: '[mcsDataStatusDef]'
})

export class DataStatusDefDirective {

  @ContentChild(DataEmptyDefDirective)
  public dataEmptyDef: DataEmptyDefDirective;

  @ContentChild(DataErrorDefDirective)
  public dataErrorDef: DataErrorDefDirective;
}
