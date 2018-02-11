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
import { ListHeaderDirective } from './list-header.directive';

@Component({
  selector: 'mcs-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'list-wrapper'
  }
})

export class ListComponent implements AfterViewInit {
  @Input()
  public header: string;

  @Input()
  public spacing: 'xsmall' | 'small' | 'medium';

  @ContentChild(ListHeaderDirective)
  public headerTemplate: TemplateRef<any>;

  public constructor(
    private _elementRef: ElementRef,
    private _renderer: Renderer2
  ) {
    this.spacing = 'small';
  }

  public ngAfterViewInit(): void {
    this._renderer.addClass(this._elementRef.nativeElement, this.spacing);
  }

}
