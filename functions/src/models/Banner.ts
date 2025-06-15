import BaseModel from "./BaseModel";

export type TBannerData = Partial<Banner>;

export class Banner extends BaseModel {
  id!: string;
  uri!: string;
  name!: string;
  createdAt!: string;
  visible!: boolean;

  constructor(data: TBannerData) {
    super();

    Object.assign(this, data);
  }
}

export default Banner;
