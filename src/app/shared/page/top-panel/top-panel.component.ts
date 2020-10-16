import {
  Component,
  Input,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild,
  ContentChildren,
  AfterContentInit,
  OnDestroy,
  QueryList,
  ElementRef,
  Renderer2
} from '@angular/core';
import { Subject } from 'rxjs';
import {
  startWith,
  takeUntil
} from 'rxjs/operators';
import {
  coerceBoolean,
  unsubscribeSafely
} from '@app/utilities';
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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'top-panel-wrapper'
  }
})

export class TopPanelComponent implements AfterContentInit, OnDestroy {

  @Input()
  public get active(): boolean { return this._active; }
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

  private _destroySubject = new Subject<void>();

  constructor(
    private _elementRef: ElementRef,
    private _renderer: Renderer2,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  public ngAfterContentInit() {
    Promise.resolve().then(() => {
      this._topPanelItemDefinition.changes.pipe(
        startWith(null), takeUntil(this._destroySubject)
      ).subscribe(() => {
        this._topPanelItemPlaceholder.viewContainer.clear();
        this._topPanelItemDefinition.forEach((item) => {
          this._topPanelItemPlaceholder.viewContainer.createEmbeddedView(item.template);
        });
        this._changeDetectorRef.markForCheck();
      });
    });
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  private _setActiveParentElement(value: boolean): void {
    if (value) {
      this._renderer.addClass(this._elementRef.nativeElement.parentElement, 'active');
    } else {
      this._renderer.removeClass(this._elementRef.nativeElement.parentElement, 'active');
    }
  }
}
