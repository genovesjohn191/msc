import {
  Component,
  Input,
  AfterViewInit,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ViewChild,
  ContentChild
} from '@angular/core';
import {
  McsPortalTemplate,
  McsUniqueId
} from '@app/core';
import { TabLabelDirective } from './tab-label.directive';

@Component({
  selector: 'mcs-tab',
  templateUrl: './tab.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'tab-wrapper',
    '[id]': 'id'
  }
})

export class TabComponent implements AfterViewInit {

  public portalTemplate: McsPortalTemplate<any>;

  @Input()
  public id: any = McsUniqueId.NewId('tab');

  @Input()
  public label: string;

  @ContentChild(TabLabelDirective, { static: false })
  public labelTemplate: TabLabelDirective;

  @ViewChild(TemplateRef, { static: false })
  private _content: TemplateRef<any>;

  constructor(private _viewContainerRef: ViewContainerRef) { }

  public ngAfterViewInit(): void {
    this.portalTemplate = new McsPortalTemplate(this._content, this._viewContainerRef);
  }
}
