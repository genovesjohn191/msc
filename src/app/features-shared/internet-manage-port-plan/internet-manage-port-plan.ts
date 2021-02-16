export class InternetManagePortPlan {
  public monthlyCap: number;
  public portSpeed: number;
  public portSpeedIndex: number;
  public valid: boolean;
  public hasChanged: boolean;
}

// Port speed values in Mbps
export const internetPortSpeedSliderDefaultValues = [
  5, 10, 15, 20, 25, 30, 40, 45, 50, 60, 65, 70, 75, 80, 90, 100, 110,
  120, 125, 130, 140, 150, 155, 160, 170, 180, 190, 200, 225, 250, 300,
  350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 1000
]