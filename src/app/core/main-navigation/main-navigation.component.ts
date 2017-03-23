import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

/** Providers */
import { TextContentProvider } from '../providers/text-content.provider';

/** Services */
import {
  McsAuthService,
  UserTypeEnum
} from '../services/mcs-auth.service';

@Component({
  selector: 'mcs-main-navigation',
  templateUrl: './main-navigation.component.html',
  styles: [require('./main-navigation.component.scss')]
})

export class MainNavigationComponent {
  public textContent: any;

  public constructor(
    private _textProvider: TextContentProvider,
    private _authService: McsAuthService,
    private _titleService: Title
  ) {
    this.textContent = this._textProvider.content;
  }

  public isUser(): boolean {
    return this._authService.userType === UserTypeEnum.User;
  }

  public setTitle(title: string) {
    this._titleService.setTitle(title);
  }
}
