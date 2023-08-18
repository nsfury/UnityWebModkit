export function waitFor(conditionFunction: Function): Promise<void> {
  return new Promise<void>((resolve) => {
    const poll = () => {
      if (conditionFunction()) {
        resolve();
      } else {
        setTimeout(poll, 400);
      }
    };
    poll();
  });
}

export function makeId(length: number): string {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

export function patternSearch(
  mainArray: Uint8Array,
  subArray: Uint8Array,
): number[] {
  const indexes: number[] = [];
  if (subArray.length === 0) return indexes;

  const lps = generateLPSArray(subArray);
  let i = 0;
  let j = 0;

  while (i < mainArray.length) {
    if (mainArray[i] === subArray[j]) {
      i++;
      j++;
    }

    if (j === subArray.length) {
      indexes.push(i - j);
      j = lps[j - 1];
    } else if (i < mainArray.length && mainArray[i] !== subArray[j]) {
      if (j !== 0) {
        j = lps[j - 1];
      } else {
        i++;
      }
    }
  }

  return indexes;
}

export function concatenateUint8Arrays(arrays: Uint8Array[]) {
  // Calculate the total length of the concatenated array
  let totalLength = 0;
  arrays.forEach((array) => {
    totalLength += array.length;
  });

  // Create a new Uint8Array with the total length
  const concatenatedArray = new Uint8Array(totalLength);

  // Use the set() method to copy the contents of each Uint8Array into the concatenated array
  let offset = 0;
  arrays.forEach((array) => {
    concatenatedArray.set(array, offset);
    offset += array.length;
  });

  return concatenatedArray;
}

export function uint8ArrayStartsWith(
  array: Uint8Array,
  expectedNumbers: number[],
) {
  if (array.length < expectedNumbers.length) {
    return false;
  }

  for (let i = 0; i < expectedNumbers.length; i++) {
    if (array[i] !== expectedNumbers[i]) {
      return false;
    }
  }

  return true;
}

export function writeUint8ArrayAtOffset(
  destination: Uint8Array,
  source: Uint8Array,
  offset: number,
): void {
  if (offset + source.length > destination.length) {
    throw new Error(
      "Source array does not fit at the specified offset in the destination array.",
    );
  }

  for (let i = 0; i < source.length; i++) {
    destination[offset + i] = source[i];
  }
}

export function bufToHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

function generateLPSArray(pattern: Uint8Array): number[] {
  const lps: number[] = [];
  lps[0] = 0;
  let len = 0;
  let i = 1;

  while (i < pattern.length) {
    if (pattern[i] === pattern[len]) {
      len++;
      lps[i] = len;
      i++;
    } else {
      if (len !== 0) {
        len = lps[len - 1];
      } else {
        lps[i] = 0;
        i++;
      }
    }
  }

  return lps;
}
