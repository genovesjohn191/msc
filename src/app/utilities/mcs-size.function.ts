type unitType = 'megabyte' | 'gigabyte' | 'cpu';
let gbToMbMultiplier = 1024;

/**
 * This will return the size value together with its unit as a string
 * @param unit Unit type of the value
 * @param value Size value
 */
export function appendUnitSuffix(value: number, unit: unitType): string {

  if (!unit) { return ''; }

  let unitValue: string;

  switch (unit) {
    case 'megabyte':
      unitValue = 'MB';
      break;

    case 'gigabyte':
      unitValue = 'GB';
      break;

    case 'cpu':
      unitValue = 'vCPU';
      break;

    default:
      unitValue = '';
      break;
  }

  // Return the value with unit
  return `${value} ${unitValue}`;
}

/**
 * This will return the value converted from MB to GB
 * @param value Value in MB
 */
export function convertToGb(value: number): number {
  if (!value) { return 0; }

  return (value / gbToMbMultiplier);
}

/**
 * This will return the value converted from GB to MB
 * @param value Value in GB
 */
export function convertToMb(value: number): number {
  if (!value) { return 0; }

  return (value * gbToMbMultiplier);
}
