import { Subject } from 'rxjs';
import {
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  Directive,
  EventEmitter,
  Input,
  OnDestroy,
  Output
} from '@angular/core';
import { MatAutocomplete } from '@angular/material/autocomplete';
import {
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';

export interface IAutoCompleteScrollEvent {
  autoComplete: MatAutocomplete;
  scrollEvent: Event;
  pageIndex: number;
}

@Directive({
  selector: 'mat-autocomplete[optionsScroll]',
  exportAs: 'matOptionScroll'
})
export class FieldAutocompleteScrollDirective implements OnDestroy {
  timeoutRef: any;

  @Input()
  public thresholdPercent = 1.0;

  @Output('optionsScroll')
  public scroll = new EventEmitter<IAutoCompleteScrollEvent>();

  private _destroySubject = new Subject();
  private _pageIndex = CommonDefinition.PAGE_INDEX_DEFAULT;

  constructor(public autoComplete: MatAutocomplete) {
    this.autoComplete.opened
      .pipe(
        tap(() => {
          // Note: When autocomplete raises opened, panel is not yet created (by Overlay)
          // Note: The panel will be available on next tick
          // Note: The panel wil NOT open if there are no options to display
          this.timeoutRef = setTimeout(() => {
            // Note: remove listner just for safety, in case the close event is skipped.
            this.removeScrollEventListener();
            this.autoComplete.panel.nativeElement.addEventListener(
              'scroll',
              this.onScroll.bind(this)
            );
          });
        }),
        takeUntil(this._destroySubject)
      )
      .subscribe();

    this.autoComplete.closed
      .pipe(
        tap(() => this.removeScrollEventListener()),
        takeUntil(this._destroySubject)
      )
      .subscribe();
  }


  public ngOnDestroy() {
    clearTimeout(this.timeoutRef);
    unsubscribeSafely(this._destroySubject);

    this.removeScrollEventListener();
  }

  public onScroll(event: any) {
    if (this.thresholdPercent === undefined) {
      this.scroll.next({
        autoComplete: this.autoComplete,
        scrollEvent: event,
        pageIndex: ++this._pageIndex
      });
    } else {
      const threshold = (this.thresholdPercent * 100 * event.target.scrollHeight) / 100;
      const current = event.target.scrollTop + event.target.clientHeight;

      if (current >= threshold) {
        this.scroll.next({
          autoComplete: this.autoComplete,
          scrollEvent: event,
          pageIndex: ++this._pageIndex
        });
      }
    }
  }

  public resetPaging(): void {
    this._pageIndex = CommonDefinition.PAGE_INDEX_DEFAULT;
  }

  private removeScrollEventListener() {
    if (this.autoComplete.panel) {
      this.autoComplete.panel.nativeElement.removeEventListener(
        'scroll',
        this.onScroll
      );
    }
  }
}
