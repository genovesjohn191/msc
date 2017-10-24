import {
  Directive,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[mcsListPanelItemOutlet]'
})

export class ListPanelItemOutletDirective {

  /**
   * This will return the most recent Panel Item
   * to output the items on the actual position
   */
  public static mostRecentOutlet: ListPanelItemOutletDirective;

  constructor(public viewContainer: ViewContainerRef) {
    ListPanelItemOutletDirective.mostRecentOutlet = this;
  }
}
