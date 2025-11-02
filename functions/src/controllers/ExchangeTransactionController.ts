import ExchangeTransaction, {
  ExchangeTransactionStatus,
  PaymentMethod,
} from "./../models/ExchangeTransaction";
import COLLECTION_MAP from "../constant/db";
import { db, generateId } from "../utils/firebase";
import { wrapError } from "../utils/decorator/wrapError";
import AppError from "../utils/formatter/AppError";
import {
  createPage,
  TPaginateConstruct,
  TPaginatedPage,
} from "../utils/pagination";
import { UserRole } from "../models/User";
import { TGetUserRes } from "../dto/user";
import { ExchangeItemType } from "../models/ExchangeItem";
import { VoucherController } from "./VoucherController";
import {
  TCheckTransactionRes,
  TCreateExchangeTransaction,
  TGetExchangeTransaction,
  TGetExchangeTransactionRes,
} from "../dto/exchangeTransaction";

import { Currency } from "../constant/currency";
import ExchangeTransactionItem from "../models/ExchangeTransactionItem";
import { UserVoucherController } from "./UserVoucherController";
import UserVoucher, { UserVoucherStatus } from "../models/UserVoucher";
import Voucher from "../models/Voucher";
import { InventoryItemController } from "./InventoryItemController";
import { ExchangeItemController } from "./ExchangeItemController";
import { TGetExchangeItemRes } from "../dto/exchangeItem";
import { TGetInventoryItemRes } from "../dto/inventoryItem";
import { UserController } from "./UserController";
import { UserPointController } from "./UserPointController";
import { UserPointHistorySourceType } from "../models/UserPointHistory";

export type TGetTransactionOpt = {
  withItems?: boolean;
};

export class ExchangeTransactionController {
  @wrapError
  public static async getTransaction(
    user: TGetUserRes,
    { id }: TGetExchangeTransaction,
    { withItems }: TGetTransactionOpt = {},
  ): Promise<TGetExchangeTransactionRes | null> {
    const ref = db.collection(COLLECTION_MAP.EXCHANGE_TRANSACTION).doc(id);
    const snapshot = await ref.get();
    const doc = snapshot.data();
    if (!doc) {
      return null;
    }
    const data = new ExchangeTransaction(doc);

    if (user.data.role === UserRole.USER && data.maker !== user.data.id) {
      throw new AppError(404, "EXCHANGE.TRANSACTION_NOT_FOUND");
    }

    if (withItems) {
      // Get subcollection of logistic_item
      const itemsSnapshot = await ref
        .collection(COLLECTION_MAP.EXCHANGE_TRANSACTION_ITEM)
        .get();

      data.items = itemsSnapshot.docs.map(
        (doc) => new ExchangeTransactionItem(doc.data()),
      );
    }

    return {
      data,
      ref,
      snapshot,
    };
  }

  @wrapError
  public static async getTransactions(
    user: TGetUserRes,
    filters: TPaginateConstruct<ExchangeTransaction>,
    { withItems }: TGetTransactionOpt = {},
  ): Promise<TPaginatedPage<ExchangeTransaction>> {
    filters.construct = ExchangeTransaction;
    if (user.data.role === UserRole.USER) {
      filters.addQuery = (q) => q.where("maker", "==", user.data.id);
    }

    const { items, pagination } = await createPage<ExchangeTransaction>(
      COLLECTION_MAP.EXCHANGE_TRANSACTION,
      filters,
    );

    await Promise.all(
      items.map(async (trx) => {
        if (withItems) {
          const itemSnapshots = await db
            .collection(COLLECTION_MAP.EXCHANGE_TRANSACTION)
            .doc(trx.id)
            .collection(COLLECTION_MAP.EXCHANGE_TRANSACTION_ITEM)
            .get();

          trx.items = itemSnapshots.docs.map(
            (doc) => new ExchangeTransactionItem(doc.data()),
          );
        }
      }),
    );

    return {
      items,
      pagination,
    };
  }

  @wrapError
  public static async checkTransaction(
    user: TGetUserRes,
    data: TCreateExchangeTransaction,
  ): Promise<TCheckTransactionRes> {
    const itemIds = data.items.map((i) => i.id);
    const items = await ExchangeItemController.getAvailableItemByIds(itemIds);

    const requestItems = data.items.map((i) => {
      const exchangeItem = items.find((item) => item.id === i.id);
      if (!exchangeItem) {
        throw new AppError(404, "EXCHANGE.TRANSACTION_SOME_ITEM_NOT_FOUND");
      }
      return new ExchangeTransactionItem({
        exchangeTransactionId: exchangeItem.id,
        sourceId: exchangeItem.sourceId,
        qty: i.qty,
      });
    });

    if (items.length !== requestItems.length) {
      throw new AppError(404, "EXCHANGE.TRANSACTION_SOME_ITEM_NOT_FOUND");
    }

    const timestamp = new Date();
    let amount = 0;
    for (const item of requestItems) {
      const exchangeItem = items.find(
        (i) => i.id === item.exchangeTransactionId,
      );
      if (!exchangeItem) {
        throw new AppError(404, "EXCHANGE.TRANSACTION_SOME_ITEM_NOT_FOUND");
      }

      if (exchangeItem.availableAt > timestamp) {
        throw new AppError(400, "EXCHANGE.TRANSACTION_SOME_ITEM_UNAVAILABLE");
      }

      if (exchangeItem.endedAt && timestamp > exchangeItem.endedAt) {
        throw new AppError(400, "EXCHANGE.TRANSACTION_SOME_ITEM_UNAVAILABLE");
      }

      const price = exchangeItem.prices.find(
        (p) => p.currency === data.currency,
      );
      if (!price) {
        throw new AppError(400, "EXCHANGE.TRANSACTION_PRICE_UNMATCH");
      }

      amount += price.amount * item.qty;
    }

    if (data.paymentMethod === PaymentMethod.POINT) {
      if (data.currency !== Currency.REVIBE_POINT) {
        throw new AppError(
          400,
          "EXCHANGE.TRANSACTION_CURRENCY_INVALID_FOR_SELECTED_METHOD",
        );
      }

      if (!user.data.hasMinimumBalance(amount)) {
        throw new AppError(403, "USER.INSUFFICIENT_BALANCE");
      }
    }

    let userVoucher: UserVoucher | null = null;
    let voucher: Voucher | null = null;
    let discount = 0;
    if (data.voucherCode) {
      const userVouchers = await UserVoucherController.getVouchersByCode(user, {
        code: data.voucherCode,
      });
      const availableVoucher = userVouchers.find(
        (v) => v.status === UserVoucherStatus.AVAILABLE,
      );
      if (!availableVoucher) {
        throw new AppError(400, "USER_VOUCHER.CODE_INVALID");
      }
      userVoucher = availableVoucher;

      if (userVoucher.expiredAt && userVoucher.expiredAt <= timestamp) {
        await UserVoucherController.invalidateVoucher(user, userVoucher);
        throw new AppError(400, "USER_VOUCHER.ALREADY_EXPIRED");
      }

      const voucherRes = await VoucherController.getVoucher(user, {
        id: userVoucher.voucherId,
      });
      if (!voucherRes) {
        throw new AppError(400, "USER_VOUCHER.CODE_INVALID");
      }

      if (!voucherRes.data.isClaimBetweenPeriod(timestamp, timestamp)) {
        await UserVoucherController.invalidateVoucher(user, userVoucher);
        throw new AppError(400, "USER_VOUCHER.ALREADY_EXPIRED");
      }

      const claimedVoucher = userVouchers.filter(
        (v) => v.status === UserVoucherStatus.REDEEMED,
      );

      const conditions = voucherRes.data.conditions;
      if (conditions?.minOrderAmount && amount < conditions?.minOrderAmount) {
        throw new AppError(
          400,
          "USER_VOUCHER.CONDITIONS_MIN_ORDER_AMOUNT_UNFULFILLED",
        );
      }

      if (conditions?.minOrderItem && items.length < conditions?.minOrderItem) {
        throw new AppError(
          400,
          "USER_VOUCHER.CONDITIONS_MIN_ORDER_ITEM_UNFULFILLED",
        );
      }

      if (conditions?.maxUsage && amount >= conditions?.maxUsage) {
        throw new AppError(
          400,
          "USER_VOUCHER.CONDITIONS_MAX_USAGE_UNFULFILLED",
        );
      }

      if (
        conditions?.maxClaim &&
        claimedVoucher?.length >= conditions?.maxClaim
      ) {
        throw new AppError(
          400,
          "USER_VOUCHER.CONDITIONS_MAX_CLAIM_UNFULFILLED",
        );
      }

      voucher = voucherRes.data;
      discount = voucher.calculateDiscount(amount);
    }

    return {
      timestamp,
      amount,
      discount,
      total: amount - discount,
      userVoucher,
      voucher,
      requestItems,
      items,
    };
  }

  @wrapError
  public static async createTransaction(
    user: TGetUserRes,
    data: TCreateExchangeTransaction,
  ): Promise<ExchangeTransaction> {
    if (!user.data.verified) {
      throw new AppError(403, "USER.NOT_VERIFIED");
    }

    const checkResult = await this.checkTransaction(user, data);

    // fullfill request items with metadata
    const [purchasedVouchers, purchasedItems] = await Promise.all([
      (async () => {
        const ids = checkResult.items
          .filter((i) => i.type === ExchangeItemType.VOUCHER)
          .map((i) => i.sourceId);
        return await VoucherController.getAvailableVoucherByIds(ids);
      })(),
      (async () => {
        const ids = checkResult.items
          .filter((i) => i.type === ExchangeItemType.ITEM)
          .map((i) => i.sourceId);
        return await InventoryItemController.getAvailableItemByIds(ids);
      })(),
    ]);

    checkResult.requestItems.forEach((i) => {
      const item = checkResult.items.find(
        (item) => item.sourceId === i.sourceId,
      );
      if (!item) {
        throw new AppError(400, "EXCHANGE.TRANSACTION_ITEM_NOT_FOUND");
      }

      i.id = generateId();
      i.type = item.type;
      i.metadata =
        item.type === ExchangeItemType.VOUCHER
          ? purchasedVouchers
              .find((v) => v.id === item.sourceId)
              ?.getMetadataFields()
          : purchasedItems
              .find((v) => v.id === item.sourceId)
              ?.getMetadataFields();
    });

    switch (data.paymentMethod) {
      case PaymentMethod.POINT:
        return await this.proceedTransactionWithPoint(user, data, checkResult);
    }
  }

  @wrapError
  public static async proceedTransactionWithPoint(
    user: TGetUserRes,
    request: TCreateExchangeTransaction,
    {
      amount,
      discount,
      total,
      userVoucher,
      voucher,
      requestItems,
    }: TCheckTransactionRes,
  ): Promise<ExchangeTransaction> {
    const docRef = db.collection(COLLECTION_MAP.EXCHANGE_TRANSACTION).doc();

    const newTrx = new ExchangeTransaction({
      id: docRef.id,
      maker: user.data.id,
      voucherCode: userVoucher ? userVoucher.code : null,
      amount: amount,
      discount: discount,
      total: total,
      paymentMethod: request.paymentMethod,
      currency: request.currency,
      status: ExchangeTransactionStatus.PAID,
      createdAt: new Date(),

      voucherMetadata: voucher ? voucher.getMetadataFields() : undefined,
    });

    await db.runTransaction(async (transaction) => {
      // Firestore transactions require all reads to be executed before all writes.
      const dbUser: TGetUserRes = await UserController.txGetUser(
        user.data.id,
        transaction,
      );
      const dbExchangeItems: TGetExchangeItemRes[] = [];
      const dbInventoryItems: TGetInventoryItemRes[] = [];

      for (const i of requestItems) {
        const dbExchangeItem = await ExchangeItemController.txGetItem(
          i.exchangeTransactionId,
          transaction,
        );
        dbExchangeItems.push(dbExchangeItem);

        if (i.type === ExchangeItemType.ITEM) {
          const dbInvenItem = await InventoryItemController.txGetItem(
            i.sourceId,
            transaction,
          );
          dbInventoryItems.push(dbInvenItem);
        }
      }

      // 1. Save exchange transaction
      transaction.set(docRef, newTrx.toObject());

      // 2. save and update stock for requested items
      for (const i of requestItems) {
        // save exchange transaction item
        const trxItemRef = docRef
          .collection(COLLECTION_MAP.EXCHANGE_TRANSACTION_ITEM)
          .doc(i.id);
        transaction.set(trxItemRef, i.toObject());

        // update stock for exchange item
        const exchangeItem = dbExchangeItems.find(
          (item) => item.data.id === i.exchangeTransactionId,
        );
        await ExchangeItemController.txUpdateStock(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          exchangeItem!,
          i.qty,
          transaction,
        );
        if (i.type === ExchangeItemType.ITEM) {
          // if item, update inventory item stock
          const inventoryItem = dbInventoryItems.find(
            (item) => item.data.id === i.sourceId,
          );
          await InventoryItemController.txUpdateStock(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            inventoryItem!,
            i.qty,
            transaction,
          );
        }

        // if voucher, receive voucher to user
        if (i.type === ExchangeItemType.VOUCHER) {
          const voucherItem = await VoucherController.getVoucher(user, {
            id: i.sourceId,
          });
          if (voucherItem) {
            UserVoucherController.txReceiveVoucher(
              user,
              voucherItem.data,
              i.qty,
              transaction,
            );
            await VoucherController.txUpdateUseState(voucherItem, transaction);
          }
        }
      }

      // 3. Update voucher status if used
      if (userVoucher) {
        UserVoucherController.txUseVoucher(user, userVoucher.id, transaction);
      }

      // 4. Deduct user balance
      await UserPointController.txDeductPoint(
        dbUser,
        {
          amount: total,
          sourceType: UserPointHistorySourceType.EXCHANGE,
          sourceId: newTrx.id,
        },
        transaction,
      );
    });

    newTrx.items = requestItems;

    return newTrx;
  }
}
