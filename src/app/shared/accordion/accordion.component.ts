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
import { Observable } from 'rxjs/Rx';
import { startWith } from 'rxjs/operator/startWith';
import { isNullOrEmpty } from '../../utilities';
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

  @Input()
  public multi: boolean;

  @ContentChildren(AccordionPanelComponent)
  public panelItems: QueryList<AccordionPanelComponent>;

  // Other subscriptions
  private _panelItemsSubscription: any;
  private _selectionSubscription: any;

  /**
   * Combine stream of all the selected item child's change event
   */
  public get itemsSelectionChanged(): Observable<AccordionPanelComponent> {
    return Observable.merge(...this.panelItems.map((item) => item.selectionChanged));
  }

  public ngAfterContentInit(): void {
    this._panelItemsSubscription = startWith.call(
      this.panelItems.changes,
      null
    ).subscribe(() => {
      this._listenToSelectionChange();
    });
  }

  public ngOnDestroy(): void {
    if (!isNullOrEmpty(this._selectionSubscription)) {
      this._selectionSubscription.unsubscribe();
    }
    if (!isNullOrEmpty(this._panelItemsSubscription)) {
      this._panelItemsSubscription.unsubscribe();
    }
  }

  /**
   * Listen to selection changed of the header
   *
   * `@Note:` This will not close other panel when the multi flag is true
   */
  private _listenToSelectionChange() {
    this._selectionSubscription = this.itemsSelectionChanged.subscribe((panel) => {
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
