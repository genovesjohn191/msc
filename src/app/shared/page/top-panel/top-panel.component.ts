import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewChild,
  ContentChildren,
  AfterContentInit,
  QueryList,
  ElementRef,
  Renderer2
} from '@angular/core';
import {
  isNullOrEmpty,
  coerceBoolean
} from '../../../utilities';
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

  @Input()
  public get active(): boolean {
    return this._active;
  }
  public set active(value: boolean) {
    if (this._active !== value) {
      this._active = coerceBoolean(value);
      this._setActiveParentElement(this._active);
    }
  }
  private _active: boolean;

  @ViewChild(TopPanelItemPlaceholderDirective)
  private _topPanelItemPlaceholder: TopPanelItemPlaceholderDirective;

  @ContentChildren(TopPanelItemDefDirective)
  private _topPanelItemDefinition: QueryList<TopPanelItemDefDirective>;

  constructor(
    private _elementRef: ElementRef,
    private _renderer: Renderer2
  ) { }

  public ngAfterContentInit() {
    if (!isNullOrEmpty(this._topPanelItemDefinition)) {
      this._topPanelItemDefinition.forEach((item) => {
        this._topPanelItemPlaceholder.viewContainer.createEmbeddedView(item.template);
      });
    }
  }

  private _setActiveParentElement(value: boolean): void {
    if (value) {
      this._renderer.addClass(this._elementRef.nativeElement.parentElement, 'active');
    } else {
      this._renderer.removeClass(this._elementRef.nativeElement.parentElement, 'active');
    }
  }
}
