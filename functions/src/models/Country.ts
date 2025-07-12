import BaseModel from "./BaseModel";

export type TCountryData = Partial<Country>;

export const defaultCountryData: TCountryData = {
  code: "",
  name: "",
  dialCode: null,
  visible: false,
};

export class Country extends BaseModel {
  code!: string;
  name!: string;
  dialCode?: string | null;
  visible!: boolean;

  constructor(data: TCountryData) {
    super(data, defaultCountryData);
  }
}

export default Country;
