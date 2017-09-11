import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  Renderer2,
  ElementRef,
  ChangeDetectorRef,
  Input
} from '@angular/core';
import { CoreDefinition } from '../../../core';
import {
  registerEvent,
  isNullOrEmpty
} from '../../../utilities';
import { ListPanelService } from '../list-panel.service';

@Component({
  selector: 'mcs-list-header',
  templateUrl: './list-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ListHeaderComponent implements OnInit, OnDestroy {

  @Input()
  public groupName: string;

  private _itemChangedStreamSubscription: any;

  private _collapse: boolean;
  public get collapse(): boolean {
    return this._collapse;
  }
  public set collapse(value: boolean) {
    if (this._collapse !== value) {
      this._collapse = value;
      this._toggleChildElementVisibility();
      this.changeDetectionRef.markForCheck();
    }
  }

  public constructor(
    public renderer: Renderer2,
    public elementRef: ElementRef,
    public changeDetectionRef: ChangeDetectorRef,
    public listPanelService: ListPanelService
  ) {
    this.collapse = false;
  }

  public get caretIconKey(): string {
    return this.collapse ? CoreDefinition.ASSETS_FONT_CARET_RIGHT
      : CoreDefinition.ASSETS_FONT_CARET_DOWN;
  }

  public ngOnInit(): void {
    this._toggleChildElementVisibility();
    this._listenToItemSelection();
  }

  public ngOnDestroy(): void {
    if (this._itemChangedStreamSubscription) {
      this._itemChangedStreamSubscription.unsubscribe();
    }
  }

  public onHeaderClick(): void {
    this.collapse = !this.collapse;
  }

  private _toggleChildElementVisibility(): void {
    if (isNullOrEmpty(this.elementRef)) { return; }

    let itemElements = this.elementRef.nativeElement.querySelectorAll('mcs-list-item');
    for (let element of itemElements) {
      if (this.collapse) {
        this.renderer.setStyle(element, 'display', 'none');
      } else {
        this.renderer.setStyle(element, 'display', 'block');
      }
    }
  }

  private _listenToItemSelection(): void {
    this.listPanelService.selectedItemChangedStream
      .subscribe((data) => {
        if (isNullOrEmpty(data)) { return; }
        this.collapse = !(data.groupName === this.groupName);
      });
  }
}
