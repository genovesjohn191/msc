export class Breadcrumb {
  public url: string;
  public name: string;
  public isActive: boolean;

  constructor(urlValue: string, nameValue: string) {
    this.url = urlValue;
    this.name = nameValue;
    this.isActive = false;
  }
}
