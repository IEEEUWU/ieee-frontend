/**
 * Pure TypeScript QR Code Generator (ISO/IEC 18004 compliant)
 * Zero external dependencies. Generates valid scannable SVG QR codes.
 */

// GF(256) with primitive polynomial 0x11d (x^8 + x^4 + x^3 + x^2 + 1)
const EXP: number[] = new Array(512);
const LOG: number[] = new Array(256);

(function initGalois() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    EXP[i + 255] = x;
    LOG[x] = i;
    x <<= 1;
    if (x >= 256) x ^= 0x11d;
  }
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return EXP[LOG[x] + LOG[y]];
}

function polyMul(p: number[], q: number[]): number[] {
  const result = new Array(p.length + q.length - 1).fill(0);
  for (let i = 0; i < p.length; i++) {
    for (let j = 0; j < q.length; j++) {
      result[i + j] ^= gfMul(p[i], q[j]);
    }
  }
  return result;
}

function rsGeneratorPoly(degree: number): number[] {
  let g = [1];
  for (let i = 0; i < degree; i++) {
    g = polyMul(g, [1, EXP[i]]);
  }
  return g;
}

function rsComputeRemainder(data: number[], numEc: number): number[] {
  const gen = rsGeneratorPoly(numEc);
  const remainder = data.concat(new Array(numEc).fill(0));
  for (let i = 0; i < data.length; i++) {
    const coef = remainder[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        remainder[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return remainder.slice(data.length);
}

// Table for Version 1 to 5 with ECC Level M (ISO/IEC 18004 Table 7)
// [version, size, totalDataBytes, ecBytesPerBlock, numBlocks]
const QR_VERSIONS = [
  { version: 1, size: 21, dataCap: 16, ecBytes: 10, blocks: 1 },
  { version: 2, size: 25, dataCap: 28, ecBytes: 16, blocks: 1 },
  { version: 3, size: 29, dataCap: 44, ecBytes: 26, blocks: 1 },
  { version: 4, size: 33, dataCap: 64, ecBytes: 18, blocks: 2 },
  { version: 5, size: 37, dataCap: 86, ecBytes: 24, blocks: 2 },
];

export function generateQrMatrix(text: string): boolean[][] {
  const encoder = new TextEncoder();
  const rawBytes = encoder.encode(text);

  // Pick smallest version that fits byte mode (4 bits mode + 8 bits count + rawBytes.length)
  const reqBytes = Math.ceil((4 + 8 + rawBytes.length * 8 + 4) / 8);
  let vInfo = QR_VERSIONS[0];
  for (const v of QR_VERSIONS) {
    if (v.dataCap >= reqBytes) {
      vInfo = v;
      break;
    }
    vInfo = v;
  }

  const { size, dataCap, ecBytes, blocks: numBlocks } = vInfo;

  // Build bitstream: Mode 0100 (Byte mode)
  const bits: number[] = [0, 1, 0, 0];
  // Character count indicator (8 bits for versions 1-9)
  for (let i = 7; i >= 0; i--) bits.push((rawBytes.length >> i) & 1);
  // Data bytes
  for (const b of rawBytes) {
    for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1);
  }
  // Terminator (up to 4 zeros)
  const maxBits = dataCap * 8;
  const padZeros = Math.min(4, maxBits - bits.length);
  for (let i = 0; i < padZeros; i++) bits.push(0);
  // Pad to byte boundary
  while (bits.length % 8 !== 0) bits.push(0);
  // Pad bytes 0xEC, 0x11
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < maxBits) {
    const pb = padBytes[padIdx % 2];
    for (let i = 7; i >= 0; i--) bits.push((pb >> i) & 1);
    padIdx++;
  }

  // Convert bits to bytes
  const dataWords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let word = 0;
    for (let b = 0; b < 8; b++) word = (word << 1) | bits[i + b];
    dataWords.push(word);
  }

  // Split into blocks and compute RS Error Correction per block (ISO/IEC 18004 §6.8)
  const dataPerBlock = Math.floor(dataCap / numBlocks);
  const dataBlocks: number[][] = [];
  const ecBlocks: number[][] = [];

  for (let b = 0; b < numBlocks; b++) {
    const start = b * dataPerBlock;
    const blockData = dataWords.slice(start, start + dataPerBlock);
    dataBlocks.push(blockData);
    ecBlocks.push(rsComputeRemainder(blockData, ecBytes));
  }

  // Interleave data codewords across blocks
  const totalCodewords: number[] = [];
  for (let i = 0; i < dataPerBlock; i++) {
    for (let b = 0; b < numBlocks; b++) {
      totalCodewords.push(dataBlocks[b][i]);
    }
  }

  // Interleave error correction codewords across blocks
  for (let i = 0; i < ecBytes; i++) {
    for (let b = 0; b < numBlocks; b++) {
      totalCodewords.push(ecBlocks[b][i]);
    }
  }

  // Build matrix (null = unassigned, true = dark, false = light)
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () =>
    new Array(size).fill(null),
  );
  const reserved: boolean[][] = Array.from({ length: size }, () =>
    new Array(size).fill(false),
  );

  function setModule(r: number, c: number, dark: boolean) {
    matrix[r][c] = dark;
    reserved[r][c] = true;
  }

  // Finder patterns
  function addFinder(top: number, left: number) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        setModule(top + r, left + c, isBorder || isCenter);
      }
    }
    // Separators
    for (let i = -1; i <= 7; i++) {
      if (top + i >= 0 && top + i < size) {
        if (left - 1 >= 0) setModule(top + i, left - 1, false);
        if (left + 7 < size) setModule(top + i, left + 7, false);
      }
      if (left + i >= 0 && left + i < size) {
        if (top - 1 >= 0) setModule(top - 1, left + i, false);
        if (top + 7 < size) setModule(top + 7, left + i, false);
      }
    }
  }

  addFinder(0, 0);
  addFinder(0, size - 7);
  addFinder(size - 7, 0);

  // Alignment pattern for version >= 2
  if (vInfo.version >= 2) {
    const alignPos = size - 7;
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const isBorder = Math.abs(r) === 2 || Math.abs(c) === 2;
        const isCenter = r === 0 && c === 0;
        setModule(alignPos + r, alignPos + c, isBorder || isCenter);
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (!reserved[6][i]) setModule(6, i, i % 2 === 0);
    if (!reserved[i][6]) setModule(i, 6, i % 2 === 0);
  }

  // Dark module
  setModule(size - 8, 8, true);

  // Reserve format information areas
  for (let i = 0; i < 9; i++) {
    if (i !== 6) {
      reserved[8][i] = true;
      reserved[i][8] = true;
    }
  }
  for (let i = 0; i < 8; i++) {
    reserved[8][size - 1 - i] = true;
    reserved[size - 1 - i][8] = true;
  }

  // Convert codewords to data bits
  const dataBits: number[] = [];
  for (const cw of totalCodewords) {
    for (let i = 7; i >= 0; i--) dataBits.push((cw >> i) & 1);
  }

  // Place data bits in zigzag scan
  let bitIdx = 0;
  let upward = true;
  for (let c = size - 1; c > 0; c -= 2) {
    if (c === 6) c--; // Skip vertical timing column
    const rows = upward
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const r of rows) {
      for (const colOffset of [0, -1]) {
        const col = c + colOffset;
        if (!reserved[r][col]) {
          const bit = bitIdx < dataBits.length ? dataBits[bitIdx++] : 0;
          // Apply mask pattern 0: (r + col) % 2 === 0
          const mask = (r + col) % 2 === 0;
          matrix[r][col] = (bit === 1) !== mask;
        }
      }
    }
    upward = !upward;
  }

  // Format information: Mask 0, ECC Level M (00) -> Format bits 00000 with BCH 10100110111
  // Mask pattern 0 (000), ECC M (00) = 00000. XORed with 101010000010010 gives 101010000010010
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
  // Write format info to top-left
  for (let i = 0; i <= 5; i++) matrix[8][i] = formatBits[i] === 1;
  matrix[8][7] = formatBits[6] === 1;
  matrix[8][8] = formatBits[7] === 1;
  matrix[7][8] = formatBits[8] === 1;
  for (let i = 9; i < 15; i++) matrix[14 - i][8] = formatBits[i] === 1;

  // Write format info to splits
  for (let i = 0; i < 7; i++) matrix[size - 1 - i][8] = formatBits[i] === 1;
  for (let i = 7; i < 15; i++) matrix[8][size - 15 + i] = formatBits[i] === 1;

  return matrix.map((row) => row.map((m) => !!m));
}

export function renderQrSvg(
  text: string,
  size = 200,
  darkColor = "#111111",
  lightColor = "#ffffff",
): string {
  const matrix = generateQrMatrix(text);
  const matrixSize = matrix.length;
  const margin = 2;
  const totalSize = matrixSize + margin * 2;
  const cellSize = size / totalSize;

  let rects = "";
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (matrix[r][c]) {
        const x = (c + margin) * cellSize;
        const y = (r + margin) * cellSize;
        rects += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" fill="${darkColor}"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="${lightColor}"/>${rects}</svg>`;
}
