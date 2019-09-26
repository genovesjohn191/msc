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

  @ContentChild(DataEmptyDefDirective, { static: false })
  public dataEmptyDef: DataEmptyDefDirective;

  @ContentChild(DataErrorDefDirective, { static: false })
  public dataErrorDef: DataErrorDefDirective;
}
