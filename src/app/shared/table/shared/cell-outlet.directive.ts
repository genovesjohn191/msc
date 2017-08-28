import {
  Directive,
  ViewContainerRef
} from '@angular/core';
import { DataCellDefDirective } from '../data/data-cell/data-cell-def.directive';

@Directive({
  selector: '[mcsCellOutlet]'
})

export class CellOutletDirective {

  /**
   * This will return the most recent mcsCellOutlet directive
   * to output the row on the actual position
   */
  public static mostRecentOutlet: CellOutletDirective;
  public cells: DataCellDefDirective[];
  public context: any;

  constructor(public viewContainer: ViewContainerRef) {
    CellOutletDirective.mostRecentOutlet = this;
  }
}
