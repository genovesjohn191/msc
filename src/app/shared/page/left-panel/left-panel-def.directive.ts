import {
  Input,
  Directive,
  TemplateRef
} from '@angular/core';

@Directive({
  selector: '[mcsLeftPanelDef]'
})

export class LeftPanelDefDirective {
  /**
   * Page Header
   */
  @Input('mcsLeftPanelDef')
  public get header(): string {
    return this._header;
  }
  public set header(value: string) {
    if (this._header !== value) {
      this._header = value;
    }
  }
  private _header: string;

  constructor(public template: TemplateRef<any>) { }
}
