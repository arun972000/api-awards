import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumber,
  type CountryCode,
} from 'libphonenumber-js';

export const defaultPhoneCountry: CountryCode = 'IN';

export type PhoneCountry = {
  code: CountryCode;
  name: string;
  dialCode: string;
  flag: string;
};

/**
 * Regional indicator pairs. Phones and macOS draw these as flags; Windows draws
 * the two letters instead, which still reads correctly beside the country name.
 */
function flagEmoji(code: string) {
  return String.fromCodePoint(
    ...[...code].map((character) => 0x1f1e6 + character.charCodeAt(0) - 65),
  );
}

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

// Dial codes come from libphonenumber-js so they stay correct as countries
// change them, and names come from Intl rather than a hand-kept table.
export const phoneCountries: PhoneCountry[] = getCountries()
  .map((code) => ({
    code,
    name: regionNames.of(code) ?? code,
    dialCode: getCountryCallingCode(code),
    flag: flagEmoji(code),
  }))
  .sort((a, b) => a.name.localeCompare(b.name, 'en'));

const countryByCode = new Map(phoneCountries.map((country) => [country.code as string, country]));

export function findPhoneCountry(code: string | undefined) {
  return countryByCode.get(code ?? '') ?? countryByCode.get(defaultPhoneCountry)!;
}

export function isSupportedPhoneCountry(code: string): code is CountryCode {
  return countryByCode.has(code);
}

/** Digits only. Lengths differ by country, so nothing is truncated here. */
export function normalisePhoneDigits(value: string) {
  return value.replace(/\D/gu, '').slice(0, 15);
}

export function isValidNationalNumber(nationalNumber: string, country: string) {
  if (!isSupportedPhoneCountry(country)) return false;
  try {
    return isValidPhoneNumber(nationalNumber, country);
  } catch {
    return false;
  }
}

/** E.164, for storage and for the export. Falls back to a readable join. */
export function toInternationalNumber(nationalNumber: string, country: string) {
  if (!nationalNumber) return '';
  if (isSupportedPhoneCountry(country)) {
    try {
      return parsePhoneNumber(nationalNumber, country).number as string;
    } catch {
      // Fall through to the manual join below.
    }
  }
  return '+' + findPhoneCountry(country).dialCode + nationalNumber;
}
