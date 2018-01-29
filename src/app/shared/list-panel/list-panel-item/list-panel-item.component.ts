import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ElementRef,
  Renderer2,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  registerEvent,
  unregisterEvent,
  isNullOrEmpty,
  unsubscribeSafely
} from '../../../utilities';
import { ListPanelService } from '../list-panel.service';
import { McsListPanelItem } from '../../../core';

@Component({
  selector: 'mcs-list-panel-item',
  templateUrl: './list-panel-item.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'list-panel-item-wrapper'
  }
})

export class ListPanelItemComponent implements OnInit, OnDestroy {

  @Input()
  public itemId: any;

  @Input()
  public groupName: any;

  private _itemChangedStreamSubscription: any;

  /**
   * Click event handler
   */
  private _clickEventHandler = this.onClickItem.bind(this);

  public constructor(
    public elementRef: ElementRef,
    public renderer: Renderer2,
    public listPanelService: ListPanelService
  ) { }

  public ngOnInit() {
    this._listenToItemSelection();
    registerEvent(this.elementRef.nativeElement, 'click', this._clickEventHandler);
  }

  public ngOnDestroy() {
    unregisterEvent(this.elementRef.nativeElement, 'click', this._clickEventHandler);
    unsubscribeSafely(this._itemChangedStreamSubscription);
  }

  public onClickItem(): void {
    this.listPanelService.selectedItemChangedStream.next({
      itemId: this.itemId,
      groupName: this.groupName
    } as McsListPanelItem);
  }

  private _listenToItemSelection(): void {
    this._itemChangedStreamSubscription = this.listPanelService.selectedItemChangedStream
      .subscribe((data) => {
        if (isNullOrEmpty(data)) { return; }
        let itemIsSelected = this.itemId === data.itemId;
        let itemIsInGroup = this.groupName === data.groupName;

        if (itemIsSelected) {
          this.renderer.addClass(this.elementRef.nativeElement, 'active');
        } else {
          this.renderer.removeClass(this.elementRef.nativeElement, 'active');
        }

        if (itemIsInGroup) {
          this.renderer.addClass(this.elementRef.nativeElement.parentElement, 'active');
        } else {
          this.renderer.removeClass(this.elementRef.nativeElement.parentElement, 'active');
        }
      });
  }
}
