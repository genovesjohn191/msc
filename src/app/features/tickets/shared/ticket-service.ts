export class TicketService {
  public id: string;
  public name: string;

  constructor(_name: string, _id: string) {
    this.id = _id;
    this.name = _name;
  }
}
