import BaseModel from "./BaseModel";

export type TCountryData = Partial<Country>;

export class Country extends BaseModel {
  code!: string;
  name!: string;
  dialCode?: string;
  visible!: boolean;

  constructor(data: TCountryData) {
    super();

    Object.assign(this, data);
  }
}

export default Country;
