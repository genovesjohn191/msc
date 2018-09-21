import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  ContentChildren,
  AfterContentInit,
  QueryList
} from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  LeftPanelItemDefDirective
} from './left-panel-item/left-panel-item-def.directive';
import {
  LeftPanelItemPlaceholderDirective
} from './left-panel-item/left-panel-item-placeholder.directive';

@Component({
  selector: 'mcs-left-panel',
  template: `
    <div class="left-panel-wrapper" scrollable>
      <ng-container mcsLeftPanelItemPlaceholder></ng-container>
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'display-flex-row flex-auto',
    'style': 'overflow: hidden'
  }
})

export class LeftPanelComponent implements AfterContentInit {

  @ViewChild(LeftPanelItemPlaceholderDirective)
  private _leftPanelItemPlaceholder: LeftPanelItemPlaceholderDirective;

  @ContentChildren(LeftPanelItemDefDirective)
  private _leftPanelItemDefinition: QueryList<LeftPanelItemDefDirective>;

  public ngAfterContentInit() {
    if (!isNullOrEmpty(this._leftPanelItemDefinition)) {
      this._leftPanelItemDefinition.forEach((item) => {
        this._leftPanelItemPlaceholder.viewContainer.createEmbeddedView(item.template);
      });
    }
  }
}
