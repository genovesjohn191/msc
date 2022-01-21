declare global {
  interface String {
    toColor(): string;
    toHex(): string;
    toRGB(): string;
    toRandomGreyHex(): string;
    toDefinedGreyHex(index: number): string;
    truncate(truncateLength: number): string;
  }
}

String.prototype.truncate = function (truncateLength: number) {
  if (this.length === 0) return this;
  let exceeded = this.length > truncateLength;

  return exceeded ?
    `${this.substring(0, truncateLength)}...` :
    this;
}

String.prototype.toDefinedGreyHex = (index: number) => {
  let definedColors = [
    '#8F8F8F', '#E1E1E1', '#D4D4D4',
    '#676767', '#A5A5A5', '#808080',
    '#949494', '#7B7B7B', '#979797',
    '#7D7D7D', '#616161', '#757575',
    '#A9A9A9', '#909090', '#8A8A8A',
    '#777777', '#797979', '#767676',
    '#8B8B8B', '#C0C0C0'
  ];
  let actualIndex = Math.min(index, definedColors.length - 1);
  return definedColors[actualIndex];
}

String.prototype.toRandomGreyHex = () => {
  let v = (Math.random() * (256) | 0).toString(16);
  return `#` + v + v + v;
}

String.prototype.toRGB = function () {
  let hash = 0;
  if (this.length === 0) return `${hash}`;

  for (let i = 0; i < this.length; i++) {
    hash = this.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  let rgb = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 255;
    rgb[i] = value;
  }
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

String.prototype.toHex = function () {
  let hash = 0;
  if (this.length === 0) return `${hash}`;

  for (let i = 0; i < this.length; i++) {
    hash = this.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 255;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

String.prototype.toColor = function (colors?: string[]) {
  let hash = 0;
  if (colors?.length === 0) return `${hash}`;

  for (let i = 0; i < colors.length; i++) {
    hash = this.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  hash = ((hash % colors.length) + colors.length) % colors.length;
  return colors[hash];
}

export { };
