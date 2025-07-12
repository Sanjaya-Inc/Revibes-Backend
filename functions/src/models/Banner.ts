import BaseModel from "./BaseModel";

export type TBannerData = Partial<Banner>;

export const defaultBannerData: TBannerData = {
  id: "",
  uri: "",
  name: "",
  createdAt: new Date(),
  visible: false,
};

export class Banner extends BaseModel {
  id!: string;
  uri!: string;
  name!: string;
  createdAt!: Date;
  visible!: boolean;

  constructor(data: TBannerData) {
    super(data, defaultBannerData);
  }
}

export default Banner;
