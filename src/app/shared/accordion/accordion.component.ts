import {
  Component,
  Input,
  QueryList,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  OnDestroy,
  AfterContentInit,
  ContentChildren
} from '@angular/core';
import {
  Observable,
  merge,
  Subject
} from 'rxjs';
import {
  startWith,
  takeUntil
} from 'rxjs/operators';
import {
  coerceBoolean,
  unsubscribeSubject
} from '@app/utilities';
import { AccordionPanelComponent } from './accordion-panel/accordion-panel.component';

@Component({
  selector: 'mcs-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'accordion-wrapper'
  }
})

export class AccordionComponent implements AfterContentInit, OnDestroy {
  @ContentChildren(AccordionPanelComponent)
  public panelItems: QueryList<AccordionPanelComponent>;

  // Other subscriptions
  private _destroySubject = new Subject<void>();

  /**
   * Combine stream of all the selected item child's change event
   */
  public get itemsSelectionChanged(): Observable<AccordionPanelComponent> {
    return merge(...this.panelItems.map((item) => item.selectionChanged));
  }

  @Input()
  public get multi(): boolean { return this._multi; }
  public set multi(value: boolean) { this._multi = coerceBoolean(value); }
  private _multi: boolean;

  public ngAfterContentInit(): void {
    this.panelItems.changes
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(() => {
        this._listenToSelectionChange();
      });
  }

  public ngOnDestroy(): void {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Listen to selection changed of the header
   *
   * `@Note:` This will not close other panel when the multi flag is true
   */
  private _listenToSelectionChange() {
    let resetSubject = merge(this.panelItems.changes, this._destroySubject);

    this.itemsSelectionChanged
      .pipe(takeUntil(resetSubject))
      .subscribe((panel) => {
        if (!this.multi) {
          this._closeOtherPanels(panel);
        }
      });
  }

  /**
   * Close the other panel except to the selected one
   */
  private _closeOtherPanels(selectedPanel: AccordionPanelComponent): void {
    this.panelItems.forEach((panel) => {
      if (panel.id !== selectedPanel.id) {
        panel.closePanel();
      }
    });
  }
}
