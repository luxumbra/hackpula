import CryptoJS from 'crypto-js';
import base64url from 'base64url';
import { Buffer } from 'buffer';

export interface CryptoItemType {
  name: string;
  units: number;
  amount: string;
}

export interface PaymentUrlOptions {
  profileID: string;
  secretKey: string;
  paymentID: string;
  totalAmount: string;
  items: CryptoItemType[];
  email: string;
  successUrl: string;
  failUrl: string;
  backUrl: string;
  successUrlCallback?: string; // Mark as optional
  failUrlCallback?: string; // Mark as optional
  statusUrlCallback: string;
  description: string;
  language: string;
}

export const getFormattedDate = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-us', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

/**
 * Converts a CryptoJS word array to a Uint8Array for use with base64url in the browser
 * @param wordArray - CryptoJS word array
 * @returns byteArray - Uint8Array
 */

export function wordArrayToUint8Array(wordArray) {
  const byteArray = new Uint8Array(wordArray.words.length * 4);
  let i, word, offset;
  for (i = 0, offset = 0; i < wordArray.words.length; i++, offset += 4) {
    word = wordArray.words[i];
    byteArray[offset] = (word >>> 24) & 0xff;
    byteArray[offset + 1] = (word >>> 16) & 0xff;
    byteArray[offset + 2] = (word >>> 8) & 0xff;
    byteArray[offset + 3] = word & 0xff;
  }
  return byteArray.slice(0, wordArray.sigBytes);
}

/**
 * Generates a payment url with encrypted payment data for [Paycek](https://paycek.io)
 * @param options - `PaymentUrlOptions`
 * @returns paymentUrl - string - The payment url eg: https://paycek.io/processing/checkout/payment/Lq2tAU4WSnwrmebOVESGkDnUr_TJj8gAtI1AZJX3mH--
 */
export function generatePaymentUrl(options: PaymentUrlOptions) {
  const {
    profileID,
    secretKey,
    paymentID,
    totalAmount,
    email,
    successUrl,
    failUrl,
    backUrl,
    successUrlCallback,
    failUrlCallback,
    statusUrlCallback,
    description,
    language,
  } = options;

  let { items } = options;

  if (items === null) {
    items = [];
  }

  if (typeof window !== 'undefined') {
    window.global = window;
    window.Buffer = Buffer;
    const formattedItems = [];

    for (let i = 0; i < items.length; i++) {
      const newElement = {
        n: items[i]['name'],
        u: items[i]['units'],
        a: items[i]['amount'],
      };

      formattedItems.push(newElement);
    }

    const data = {
      p: totalAmount,
      id: paymentID,
      e: email,
      s: successUrl,
      f: failUrl,
      b: backUrl,
      sc: successUrlCallback,
      fc: failUrlCallback,
      stc: statusUrlCallback,
      d: description,
      i: formattedItems,
      l: language,
    };

    const dataJson = JSON.stringify(data);
    const textEncoder = new TextEncoder();
    const dataBytes = textEncoder.encode(dataJson) as Buffer;
    const dataB64 = base64url.encode(dataBytes);

    const sha256 = CryptoJS.algo.SHA256.create();
    sha256.update(dataB64);
    sha256.update(`\x00`);
    sha256.update(profileID);
    sha256.update(`\x00`);
    sha256.update(secretKey);

    const dataHashWordArray = sha256.finalize();
    const dataHashBytes = wordArrayToUint8Array(dataHashWordArray) as Buffer;
    const dataHash = base64url.encode(dataHashBytes);
    // const dataHash = base64url.encode(new Uint8Array(sha256.finalize().words.buffer));

    const paymentUrl =
      'https://paycek.io/processing/checkout/payment_create?d=' + dataB64 + '&c=' + profileID + '&h=' + dataHash;

    return paymentUrl;
  }
}
