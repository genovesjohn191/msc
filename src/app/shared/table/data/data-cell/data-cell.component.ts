import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ElementRef
} from '@angular/core';

@Component({
  selector: 'mcs-data-cell',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.hide-element]': 'hidden'
  }
})

export class DataCellComponent {
  @Input()
  public get hidden(): boolean { return this._hidden; }
  public set hidden(value: boolean) { this._hidden = value; }
  private _hidden: boolean;

  public constructor(private _elementRef: ElementRef) { }

  /**
   * Returns the host element
   */
  public get hostElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }
}
