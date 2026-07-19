import BaseModel from "./BaseModel";

export type TNewsData = Partial<News>;

export const defaultNewsData: TNewsData = {
  id: "",
  title: "",
  content: "",
  createdAt: new Date(),
  isActive: true,
};

export class News extends BaseModel {
  id!: string;
  title!: string;
  content!: string;
  createdAt!: Date;
  isActive!: boolean;

  constructor(data: TNewsData) {
    super(data, defaultNewsData);
  }
}

export default News;
