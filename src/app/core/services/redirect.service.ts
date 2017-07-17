import { Injectable } from '@angular/core';

@Injectable()
export class RedirectService {

  public redirect(url: string) {
    window.location.href = url;
  }
}
