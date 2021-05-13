import {
  Component,
  Inject,
  OnInit
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import {
  map,
  startWith
} from 'rxjs/operators';

import {
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import {
  McsTerraformDeployment,
  McsTerraformTag
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import {
  FlatOption,
  GroupedOption
} from '../dynamic-form';

export interface TerraformTagChangeDialogData {
  title: string;
  deployment: McsTerraformDeployment,
  availableTags: McsTerraformTag[],
  newTag: McsTerraformTag;
}

@Component({
  selector: 'mcs-terraform-tag-change-dialog.component',
  templateUrl: './terraform-tag-change-dialog.component.html'
})
export class TerraformTagChangeDialogComponent implements OnInit {
  public filteredOptions: Observable<FlatOption[]>;
  public filterControl = new FormControl();

  public get valid(): boolean {
    return !isNullOrEmpty(this.data.newTag) && this.data.newTag.id !== this.data.deployment.tag;
  };

  public constructor(
    public dialogRef: MatDialogRef<TerraformTagChangeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TerraformTagChangeDialogData
  ) {}

  public ngOnInit(): void {
    this._initializeFiltering();
  }

  private _filter(collection: McsTerraformTag[], searchKeyword: string): FlatOption[] {
    let options: FlatOption[] = [];

    collection.forEach((item) => {
      if (this._exluded(item)) { return; }
      if (!isNullOrEmpty(searchKeyword)) {
        let noMatch: boolean = item.name.toLowerCase().indexOf(searchKeyword) < 0;
        if (noMatch) { return; }
      }

      let option = { key: item.id, value: item.name } as FlatOption;

      options.push(option);
    });

    return options;
  }

  private _exluded(item: McsTerraformTag): boolean {
    // Exclude current deployment tag
    let currentTag: boolean = item.id === this.data.deployment.tag;
    if (currentTag) { return true; }

    return false;
  }

  private _initializeFiltering(): void {
    this.filteredOptions = this.filterControl.valueChanges
    .pipe(
      startWith(''),
      map((value) => {
        let result = this.data.availableTags.find((tag) => tag.name === value);
        if (result) {
          this.data.newTag = result;
        }

        return this._filter(this.data.availableTags, value);
      })
    );
  }
}
