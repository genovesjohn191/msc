import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  ContentChildren,
  AfterContentInit,
  QueryList
} from '@angular/core';
import { isNullOrEmpty } from '../../../utilities';
import {
  TopPanelItemPlaceholderDirective
} from './top-panel-item/top-panel-item-placeholder.directive';
import {
  TopPanelItemDefDirective
} from './top-panel-item/top-panel-item-def.directive';

@Component({
  selector: 'mcs-top-panel',
  template: `
    <ng-container mcsTopPanelItemPlaceholder></ng-container>
    <ng-content></ng-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'top-panel-wrapper'
  }
})

export class TopPanelComponent implements AfterContentInit {

  @ViewChild(TopPanelItemPlaceholderDirective)
  private _topPanelItemPlaceholder: TopPanelItemPlaceholderDirective;

  @ContentChildren(TopPanelItemDefDirective)
  private _topPanelItemDefinition: QueryList<TopPanelItemDefDirective>;

  public ngAfterContentInit() {
    if (!isNullOrEmpty(this._topPanelItemDefinition)) {
      this._topPanelItemDefinition.forEach((item) => {
        this._topPanelItemPlaceholder.viewContainer.createEmbeddedView(item.template);
      });
    }
  }
}
