import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  AfterContentInit,
  Renderer2,
  ChangeDetectionStrategy,
  ContentChild
} from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';
import { LeftPanelItemHeaderDirective } from './left-panel-item-header.directive';

type offsetType = 'small' | 'medium' | 'large';

@Component({
  selector: 'mcs-left-panel-item',
  templateUrl: './left-panel-item.component.html',
  styleUrls: ['./left-panel-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'left-panel-item-wrapper'
  }
})

export class LeftPanelItemComponent implements AfterContentInit {

  @ViewChild('itemElement')
  public itemElement: ElementRef;

  @ContentChild(LeftPanelItemHeaderDirective)
  public leftPanelItemHeader: LeftPanelItemHeaderDirective;

  /**
   * Label Panel Item Header
   */
  @Input()
  public get header(): string { return this._header; }
  public set header(value: string) {
    if (this._header !== value) {
      this._header = value;
    }
  }
  private _header: string;

  /**
   * Offset of the item from the left of the header
   */
  @Input()
  public get offset(): offsetType { return this._offset; }
  public set offset(value: offsetType) {
    if (this._offset !== value) {
      this._offset = value;
    }
  }
  private _offset: offsetType;

  constructor(private _renderer: Renderer2) { }

  public ngAfterContentInit(): void {
    Promise.resolve().then(() => {
      if (!isNullOrEmpty(this.itemElement) && !isNullOrEmpty(this.offset)) {
        this._renderer.addClass(this.itemElement.nativeElement, `item-offset-${this.offset}`);
      }
    });
  }
}
