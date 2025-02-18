export interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
  preferred?: boolean;
}

export const countries: Country[] = [
  {
    name: "United States",
    code: "US",
    dialCode: "1",
    flag: "🇺🇸",
    preferred: true
  },
  {
    name: "Brasil",
    code: "BR",
    dialCode: "55",
    flag: "🇧🇷",
    preferred: true
  },
  {
    name: "Afghanistan",
    code: "AF",
    dialCode: "93",
    flag: "🇦🇫"
  },
  {
    name: "Albania",
    code: "AL",
    dialCode: "355",
    flag: "🇦🇱"
  },
  {
    name: "Algeria",
    code: "DZ",
    dialCode: "213",
    flag: "🇩🇿"
  },
  {
    name: "Argentina",
    code: "AR",
    dialCode: "54",
    flag: "🇦🇷"
  },
  {
    name: "Australia",
    code: "AU",
    dialCode: "61",
    flag: "🇦🇺"
  },
  {
    name: "Canada",
    code: "CA",
    dialCode: "1",
    flag: "🇨🇦"
  },
  {
    name: "China",
    code: "CN",
    dialCode: "86",
    flag: "🇨🇳"
  },
  {
    name: "France",
    code: "FR",
    dialCode: "33",
    flag: "🇫🇷"
  },
  {
    name: "Germany",
    code: "DE",
    dialCode: "49",
    flag: "🇩🇪"
  },
  {
    name: "India",
    code: "IN",
    dialCode: "91",
    flag: "🇮🇳"
  },
  {
    name: "Italy",
    code: "IT",
    dialCode: "39",
    flag: "🇮🇹"
  },
  {
    name: "Japan",
    code: "JP",
    dialCode: "81",
    flag: "🇯🇵"
  },
  {
    name: "Mexico",
    code: "MX",
    dialCode: "52",
    flag: "🇲🇽"
  },
  {
    name: "Portugal",
    code: "PT",
    dialCode: "351",
    flag: "🇵🇹"
  },
  {
    name: "Russia",
    code: "RU",
    dialCode: "7",
    flag: "🇷🇺"
  },
  {
    name: "Spain",
    code: "ES",
    dialCode: "34",
    flag: "🇪🇸"
  },
  {
    name: "United Kingdom",
    code: "GB",
    dialCode: "44",
    flag: "🇬🇧"
  }
];
