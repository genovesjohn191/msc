export class TicketService {
  public id: string;
  public name: string;
  public service: string;

  constructor(_name: string, _id: string, _service: string) {
    this.id = _id;
    this.name = _name;
    this.service = _service;
  }
}
