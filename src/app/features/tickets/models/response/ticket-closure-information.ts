export class TicketClosureInformation {
  public closedBy: string;
  public closedAt: string;
  public closeNotes: string;
  public closeProblem: string;
  public closeResolution: string;

  constructor() {
    this.closedBy = undefined;
    this.closedAt = undefined;
    this.closeNotes = undefined;
    this.closeProblem = undefined;
    this.closeResolution = undefined;
  }
}
