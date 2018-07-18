import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { McsTextContentProvider } from '../../../../core';
import { ServerCreateService } from '../server-create.service';

@Component({
  selector: 'mcs-server-create-addons',
  templateUrl: 'server-create-addons.component.html'
})

export class ServerCreateAddOnsComponent implements OnInit, OnDestroy {
  public textContent: any;

  constructor(
    private _textContentProvider: McsTextContentProvider,
    private _changeDetectorRef: ChangeDetectorRef,
    private _serverCreateService: ServerCreateService
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
    this._serverCreateService.setOrderDetails(this._serverCreateService.order);
  }
}
