import {
  Component,
  Inject,
  OnInit
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  switchMap
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
  public filteredOptions: Observable<GroupedOption[]>;
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

  private _filter(collection: McsTerraformTag[], searchKeyword: string): GroupedOption[] {
    let groupedOptions: GroupedOption[] = [];

    collection.forEach((item) => {
      if (this._exluded(item)) { return; }
      if (!isNullOrEmpty(searchKeyword)) {
        let noMatch: boolean = item.name.toLowerCase().indexOf(searchKeyword) < 0;
        if (noMatch) { return; }
      }

      let groupName = item.categoryName;
      let existingGroup = groupedOptions.find((opt) => opt.name === groupName);

      let key = item.id;
      let value = item.name;

      let option = { key, value } as FlatOption;

      if (existingGroup) {
        // Add option to existing group
        existingGroup.options.push(option);
      } else {
        // Add option to new group
        groupedOptions.push({
          type: 'group',
          name: groupName,
          options: [option]
        });
      }
    });

    return groupedOptions;
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
