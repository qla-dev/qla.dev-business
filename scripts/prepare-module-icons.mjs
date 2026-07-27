import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const root = process.cwd();
const sourceDirectory = path.join(root, 'assets-source', 'module-icons');
const outputDirectory = path.join(root, 'public', 'assets');
const iconNames = ['radno-vrijeme', 'troskovi', 'dokumenti', 'projekti', 'izvjestaji'];
const outputSize = 512;
const blue = [0, 122, 255];

for (const name of iconNames) {
  const sourcePath = path.join(sourceDirectory, `${name}.png`);
  if (!fs.existsSync(sourcePath)) throw new Error(`Nedostaje izvorna ikona: ${name}`);

  const source = PNG.sync.read(fs.readFileSync(sourcePath));
  const output = new PNG({ width: outputSize, height: outputSize });

  for (let y = 0; y < outputSize; y += 1) {
    const sourceYStart = Math.floor((y * source.height) / outputSize);
    const sourceYEnd = Math.max(sourceYStart + 1, Math.floor(((y + 1) * source.height) / outputSize));

    for (let x = 0; x < outputSize; x += 1) {
      const sourceXStart = Math.floor((x * source.width) / outputSize);
      const sourceXEnd = Math.max(sourceXStart + 1, Math.floor(((x + 1) * source.width) / outputSize));
      let redTotal = 0;
      let samples = 0;

      for (let sourceY = sourceYStart; sourceY < sourceYEnd; sourceY += 1) {
        for (let sourceX = sourceXStart; sourceX < sourceXEnd; sourceX += 1) {
          redTotal += source.data[((sourceY * source.width) + sourceX) * 4];
          samples += 1;
        }
      }

      const whiteMix = Math.max(0, Math.min(1, (redTotal / samples) / 245));
      const target = ((y * outputSize) + x) * 4;
      output.data[target] = Math.round(blue[0] + ((255 - blue[0]) * whiteMix));
      output.data[target + 1] = Math.round(blue[1] + ((255 - blue[1]) * whiteMix));
      output.data[target + 2] = 255;
      output.data[target + 3] = 255;
    }
  }

  fs.writeFileSync(path.join(outputDirectory, `module-${name}.png`), PNG.sync.write(output));
}
