import COLLECTION_MAP from "../constant/db";
import { wrapError } from "../utils/decorator/wrapError";
import {
  createPage,
  TPaginateConstruct,
  TPaginatedPage,
} from "../utils/pagination";
import UserVoucher, { UserVoucherStatus } from "../models/UserVoucher";
import { TGetUserRes } from "../dto/user";

export class UserVoucherController {
  @wrapError
  public static async getVouchers(
    user: TGetUserRes,
    filters: TPaginateConstruct<UserVoucher>,
  ): Promise<TPaginatedPage<UserVoucher>> {
    filters.ref = user.ref;
    filters.addQuery = (q) =>
      q.where("status", "not-in", [
        UserVoucherStatus.REDEEMED,
        UserVoucherStatus.EXPIRED,
      ]);

    return createPage<UserVoucher>(COLLECTION_MAP.USER_VOUCHER, filters);
  }
}
