import {
  Directive,
  Renderer,
  ElementRef,
  OnInit
} from '@angular/core';

@Directive({
  selector: '[mfpFlat]'
})

export class FlatDirective implements OnInit {
  private elReference: ElementRef;
  private elRenderer: Renderer;

  constructor(_renderer: Renderer, _reference: ElementRef) {
    this.elReference = _reference;
    this.elRenderer = _renderer;
  }

  public ngOnInit() {
    this.elRenderer.setElementStyle(this.elReference.nativeElement, 'border-radius', '0');
    this.elRenderer.setElementStyle(this.elReference.nativeElement, 'color', 'red');
  }
}
