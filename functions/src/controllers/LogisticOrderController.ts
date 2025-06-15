// import {TCreateLogisticOrder, TCreateLogisticOrderRes} from "../dto/logisticOrder";
// import CountryController from "./CountryController";
// import AppError from "../utils/formatter/AppError";
// import {wrapError} from "../utils/decorator/wrapError";
// import StoreBranchController from "./StoreBranchController";

export class LogisticOrderController {
  // @wrapError
  // public static async createOrder({country, storeLocation}: TCreateLogisticOrder): Promise<TCreateLogisticOrderRes> {
  //   // validate selected country
  //   const countryRecord = await CountryController.getCountry({code: country});
  //   if (!countryRecord) {
  //     throw new AppError(404, "COUNTRY_NOT_FOUND");
  //  }
  //   // validate selected branch (drop off)
  //   const branchRecord = await StoreBranchController.getStoreBranch
  //   (storeLocation);
  //   if (!branchRecord) {
  //     throw new AppError(404, "STORE_BRANCH_NOT_FOUND");
  //  }
  //   // create list of item (upload file and create item)
  //   // create new order (pickup/dropoff)
  //   // return order id
  // }
}
