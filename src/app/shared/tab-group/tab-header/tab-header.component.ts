import {
  Component,
  ViewChild,
  ContentChildren,
  AfterContentInit,
  OnDestroy,
  QueryList,
  ChangeDetectorRef,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { isNullOrEmpty } from '../../../utilities';
import { TabHeaderItemComponent } from './tab-header-item/tab-header-item.component';
import { TabBorderBarComponent } from '../tab-border-bar/tab-border-bar.component';

@Component({
  selector: 'mcs-tab-header',
  templateUrl: './tab-header.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'tab-header-wrapper'
  }
})

export class TabHeaderComponent implements AfterContentInit, OnDestroy {

  @ViewChild(TabBorderBarComponent)
  public tabBorderBar: TabBorderBarComponent;

  @ContentChildren(TabHeaderItemComponent)
  public headerItems: QueryList<TabHeaderItemComponent>;

  private _selectionSubscription: any;

  constructor(private _changeDetectorRef: ChangeDetectorRef) { }

  public ngAfterContentInit(): void {
    if (this.headerItems) {
      this._listenToSelectionChange();
    }
  }

  public ngOnDestroy(): void {
    if (!isNullOrEmpty(this._selectionSubscription)) {
      this._selectionSubscription.unsubscribe();
    }
  }

  /**
   * Combine stream of all the selected item child's change event
   */
  public get itemsSelectionChanged(): Observable<TabHeaderItemComponent> {
    return Observable.merge(...this.headerItems.map((item) => item.selectionChanged));
  }

  /**
   * Listen to selection changed of all the items
   */
  private _listenToSelectionChange(): void {
    this._selectionSubscription = this.itemsSelectionChanged.subscribe((item) => {
      this.tabBorderBar.alignToElement(item.elementRef.nativeElement);
      this._changeDetectorRef.markForCheck();
    });
  }
}
