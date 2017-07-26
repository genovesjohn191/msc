type unitType = 'megabyte' | 'gigabyte' | 'cpu';

/**
 * This will return the size value together with its unit as a string
 * @param unitType Unit type of the value
 * @param value Size value
 */
export function appendUnitSuffix(value: number, unitType: unitType): string {

  if (!value || !unitType) { return ''; }

  let unitValue: string;

  switch (unitType) {
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
