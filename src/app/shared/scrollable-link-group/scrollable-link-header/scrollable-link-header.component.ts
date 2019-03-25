import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  Optional,
} from '@angular/core';
import {
  ResponsivePanelItemDirective
} from '../../responsive-panel/responsive-panel-item/responsive-panel-item.directive';

@Component({
  selector: 'mcs-scrollable-link-header',
  template: `<ng-content></ng-content>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'scrollable-link-header-wrapper'
  }
})

export class ScrollableLinkHeaderComponent {

  constructor(@Optional() private _responsiveItem: ResponsivePanelItemDirective) { }

  /**
   * Returns the responsive panel item
   */
  public get responsiveItem(): ResponsivePanelItemDirective {
    return this._responsiveItem;
  }
}
