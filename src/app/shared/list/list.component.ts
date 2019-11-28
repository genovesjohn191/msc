import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ElementRef,
  Renderer2,
  AfterViewInit,
  ContentChild,
  TemplateRef
} from '@angular/core';
import {
  McsSizeType,
  McsOrientationType,
  isNullOrEmpty
} from '@app/utilities';
import { ListHeaderDirective } from './list-header.directive';

@Component({
  selector: 'mcs-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'list-wrapper',
    '[class.list-horizontal]': 'orientation === "horizontal"',
    '[class.list-vertical]': 'orientation === "vertical"'
  }
})

export class ListComponent implements AfterViewInit {
  @Input()
  public header: string;

  @Input()
  public orientation: McsOrientationType;

  @Input()
  public spacing: McsSizeType;

  @Input()
  public itemsOffset: McsSizeType;

  @ContentChild(ListHeaderDirective, { static: false })
  public headerTemplate: TemplateRef<any>;

  public constructor(
    private _elementRef: ElementRef,
    private _renderer: Renderer2
  ) {
    this.spacing = 'small';
    this.itemsOffset = 'auto';
    this.orientation = 'vertical';
  }

  public ngAfterViewInit(): void {
    this._renderer.addClass(this._elementRef.nativeElement, this.spacing);
    this._renderer.addClass(this._elementRef.nativeElement, `items-offset-${this.itemsOffset}`);
  }

  public get hasCustomHeader(): boolean {
    return !isNullOrEmpty(this.headerTemplate);
  }
}
