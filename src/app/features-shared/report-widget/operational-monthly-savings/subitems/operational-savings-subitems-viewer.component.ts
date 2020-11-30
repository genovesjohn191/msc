import { Component, Input } from '@angular/core';
import { currencyFormat, isNullOrEmpty } from '@app/utilities';

@Component({
  selector: 'mcs-operational-savings-subitems-viewer',
  templateUrl: 'operational-savings-subitems-viewer.component.html'
})
export class OperationalSavingsSubitemsViewerComponent {
  @Input()
  public set obj(value: any) {
    if (isNullOrEmpty(value)) {
      this.table = '';
      return;
    }

    this._process(value);
  }

  public table: string;

  public moneyFormat(value: number): string {
    return currencyFormat(value);
  }

  public _process<T>(sourceObject: T): void {
    this.table = '';
    let convert = (source: T) => {
      let objectKeys = Object.keys(source);
      this.table += '<table class="mcs-compact-table">';
      objectKeys.forEach((fieldKey) => {
        let fieldValue = source[fieldKey];
        if (isNullOrEmpty(fieldValue.description)) { return; }
        this.table += '<tr>';
          this.table += `<td>${fieldValue.description}</td>`;
          this.table += `<td>${this.moneyFormat(fieldValue.savings)}</td>`;
        this.table += '</tr>';
      });
      this.table += '</table>';
    };
    convert(sourceObject);
  }
}