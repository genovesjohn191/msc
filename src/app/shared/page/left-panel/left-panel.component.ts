import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  ContentChildren,
  AfterContentInit,
  ViewEncapsulation,
  QueryList,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { Subject } from 'rxjs';
import {
  takeUntil,
  tap,
  startWith
} from 'rxjs/operators';
import { unsubscribeSafely } from '@app/utilities';
import {
  LeftPanelItemDefDirective
} from './left-panel-item/left-panel-item-def.directive';
import {
  LeftPanelItemPlaceholderDirective
} from './left-panel-item/left-panel-item-placeholder.directive';

@Component({
  selector: 'mcs-left-panel',
  template: `
    <div class="left-panel-content" mcsScrollable>
      <ng-container mcsLeftPanelItemPlaceholder></ng-container>
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'left-panel-wrapper',
    'style': 'overflow: hidden'
  }
})

export class LeftPanelComponent implements AfterContentInit, OnDestroy {

  @ViewChild(LeftPanelItemPlaceholderDirective, { static: true })
  private _leftPanelItemPlaceholder: LeftPanelItemPlaceholderDirective;

  @ContentChildren(LeftPanelItemDefDirective)
  private _leftPanelItemDefinition: QueryList<LeftPanelItemDefDirective>;

  private _destroySubject = new Subject<void>();

  constructor(private _changeDetectorRef: ChangeDetectorRef) { }

  public ngAfterContentInit(): void {
    this._subscribeToLeftPanelItemChanges();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  private _subscribeToLeftPanelItemChanges(): void {
    this._leftPanelItemDefinition.changes.pipe(
      takeUntil(this._destroySubject),
      startWith(null),
      tap(() => {
        this._leftPanelItemPlaceholder.viewContainer.clear();
        this._leftPanelItemDefinition.forEach((item) => {
          this._leftPanelItemPlaceholder.viewContainer.createEmbeddedView(item.template);
        });
        this._changeDetectorRef.markForCheck();
      })
    ).subscribe();
  }
}
