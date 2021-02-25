import {
  Component,
  Input
} from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';

@Component({
  selector: 'mcs-workflow-json-viewer',
  templateUrl: 'workflow-json-viewer.component.html'
})
export class WorkflowJsonViewerComponent {
  @Input()
  public set obj(value: any) {
    if (isNullOrEmpty(value)) {
      this.table = '';
      return;
    }

    this._process(value);
  }

  public table: string;

  public _process<T>(sourceObject: T): void {
    this.table = '';
    let convert = (source: any) => {
      let objectKeys = Object.keys(source);
      this.table += '<table class="mcs-compact-table">';
      objectKeys.forEach((fieldKey) => {
        let fieldType = typeof source[fieldKey];
        let fieldValue = source[fieldKey];
        this.table += '<tr>';
        if (fieldType === 'object') {
          this.table += `<td>${ fieldKey }</td>`;
          this.table += '<td>';
          convert(fieldValue);
          this.table += '</td>';
        } else {
          this.table += `<td class='right-align'>${ fieldKey }</td>`;
          this.table += `<td><b>${ this._filter(fieldKey, fieldValue) }</b></td>`;
        }
        this.table += '</tr>';
      });
      this.table += '</table>';
    };
    convert(sourceObject);
  }

  public parse(payload: any): string {
    return JSON.stringify(payload, null, 2);
  }

  private _filter(key: string, value: any): any {
    let sensitiveKeys: string[] = [
      'password'
    ];

    let keyIsSensitive = sensitiveKeys.findIndex((sensitiveKey) => sensitiveKey === key) >= 0;
    return keyIsSensitive && !isNullOrEmpty(value) ? '*secret*' : value;
  }
}
