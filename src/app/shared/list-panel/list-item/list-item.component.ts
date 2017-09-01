import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ElementRef,
  Renderer2
} from '@angular/core';
import {
  registerEvent,
  unregisterEvent,
  isNullOrEmpty
} from '../../../utilities';
import { ListPanelService } from '../list-panel.service';
import { McsListPanelItem } from '../../../core';

@Component({
  selector: 'mcs-list-item',
  templateUrl: './list-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ListItemComponent implements OnInit, OnDestroy {

  @Input()
  public itemId: any;

  @Input()
  public groupName: any;

  private _itemChangedStreamSubscription: any;

  public constructor(
    public elementRef: ElementRef,
    public renderer: Renderer2,
    public listPanelService: ListPanelService
  ) { }

  public ngOnInit() {
    this._listenToItemSelection();
    registerEvent(this.renderer, this.elementRef.nativeElement,
      'click', this.onClickItem.bind(this));
  }

  public ngOnDestroy() {
    unregisterEvent(this.elementRef.nativeElement, 'click',
      this.onClickItem.bind(this));
    if (this._itemChangedStreamSubscription) {
      this._itemChangedStreamSubscription.unsubscribe();
    }
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
        let itemIsSelected = (this.itemId === data.itemId && this.groupName === data.groupName);
        let itemIsInGroup = this.groupName === data.groupName;

        if (itemIsSelected) {
          this.renderer.addClass(this.elementRef.nativeElement, 'active');
          this.renderer.addClass(this.elementRef.nativeElement.parentElement, 'active');
        } else if (!itemIsInGroup) {
          this.renderer.removeClass(this.elementRef.nativeElement.parentElement, 'active');
        }

        if (this.itemId !== data.itemId) {
          this.renderer.removeClass(this.elementRef.nativeElement, 'active');
        }
      });
  }
}
