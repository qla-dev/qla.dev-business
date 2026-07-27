import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const root = process.cwd();
const input = path.join(root, 'assets-source', 'qla-business-chroma.png');
const lightOutput = path.join(root, 'public', 'assets', 'qla-business.png');
const darkOutput = path.join(root, 'public', 'assets', 'qla-business-dark.png');

if (!fs.existsSync(input)) {
  throw new Error('Nedostaje izvorni qla.dev Business logo.');
}

const darkImage = PNG.sync.read(fs.readFileSync(input));
for (let index = 0; index < darkImage.data.length; index += 4) {
  const red = darkImage.data[index];
  const green = darkImage.data[index + 1];
  const blue = darkImage.data[index + 2];
  const greenExcess = green - Math.max(red, blue);

  if (greenExcess <= 28) continue;

  const alpha = Math.max(0, Math.min(255, Math.round(255 * (1 - ((greenExcess - 28) / 165)))));
  darkImage.data[index + 1] = Math.min(green, Math.max(red, blue));
  darkImage.data[index + 3] = Math.min(darkImage.data[index + 3], alpha);
}

const lightImage = PNG.sync.read(PNG.sync.write(darkImage));
for (let index = 0; index < lightImage.data.length; index += 4) {
  const red = lightImage.data[index];
  const green = lightImage.data[index + 1];
  const blue = lightImage.data[index + 2];
  if (red > 225 && green > 225 && blue > 225) {
    lightImage.data[index] = 16;
    lightImage.data[index + 1] = 19;
    lightImage.data[index + 2] = 26;
  }
}

fs.writeFileSync(lightOutput, PNG.sync.write(lightImage));
fs.writeFileSync(darkOutput, PNG.sync.write(darkImage));
