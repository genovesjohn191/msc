import {
  Directive,
  Renderer2,
  ElementRef,
  OnInit
} from '@angular/core';

@Directive({
  selector: '[mcsRed]'
})

export class RedDirective implements OnInit {
  constructor(
    private _renderer: Renderer2,
    private _element: ElementRef) {
  }

  public ngOnInit() {
    this._renderer.setStyle(this._element.nativeElement, 'backgroundColor', 'red');
    this._renderer.setStyle(this._element.nativeElement, 'color', 'white');
  }
}
