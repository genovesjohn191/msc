import {
  Directive,
  TemplateRef,
  Input
} from '@angular/core';

@Directive({
  selector: '[mcsListPanelHeaderDef]'
})

export class ListPanelHeaderDefDirective {

  @Input('mcsListPanelHeaderDefPropertyName')
  public get propertyName(): string {
    return this._propertyName;
  }
  public set propertyName(value: string) {
    this._propertyName = value;
  }
  private _propertyName: string;

  constructor(public template: TemplateRef<any>) { }
}
