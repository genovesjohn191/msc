import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { McsTextContentProvider } from '@app/core';

@Component({
  selector: 'mcs-server-create-addons',
  templateUrl: 'server-create-addons.component.html'
})

export class ServerCreateAddOnsComponent implements OnInit, OnDestroy {
  public textContent: any;

  constructor(
    private _textContentProvider: McsTextContentProvider,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.servers.createServer.serverAddOnsStep;
    this._changeDetectorRef.markForCheck();
  }

  public ngOnDestroy() {
    // Release objects or subjects
  }

  public createAddOns(): void {
    // Do the creation of add-ons here
  }
}
