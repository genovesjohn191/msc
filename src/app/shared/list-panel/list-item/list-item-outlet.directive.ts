import {
  Directive,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[mcsListItemOutlet]'
})

export class ListItemOutletDirective {

  /**
   * This will return the most recent mcsItemGroupComponent
   * to output the items on the actual position
   */
  public static mostRecentOutlet: ListItemOutletDirective;

  constructor(public viewContainer: ViewContainerRef) {
    ListItemOutletDirective.mostRecentOutlet = this;
  }
}
