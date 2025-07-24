import COLLECTION_MAP from "../constant/db";
import { db } from "../utils/firebase";
import { wrapError } from "../utils/decorator/wrapError";
import AppError from "../utils/formatter/AppError";
import {
  createPage,
  TPaginateConstruct,
  TPaginatedPage,
} from "../utils/pagination";
import { UserRole } from "../models/User";
import { TGetUserRes } from "../dto/user";
import ExchangeItem, { ExchangeItemType } from "../models/ExchangeItem";
import {
  TAddExchangeItem,
  TDeleteExchangeItem,
  TGetExchangeItem,
  TGetExchangeItemRes,
  TGetExchangeItems,
} from "../dto/exchangeItem";
import { VoucherController } from "./VoucherController";
import { InventoryItemController } from "./InventoryItemController";
import { getDocsByIds } from "../utils/firestoreCommonQuery";
import { Transaction } from "firebase-admin/firestore";
import Voucher from "../models/Voucher";
import InventoryItem from "../models/InventoryItem";

export type TGetExchangeItemOpt = {
  withMetadata?: boolean;
};

export class ExchangeItemController {
  @wrapError
  public static async getPurchaseableItem(
    user: TGetUserRes,
    { id }: TGetExchangeItem,
    { withMetadata }: TGetExchangeItemOpt = {},
  ): Promise<TGetExchangeItemRes | null> {
    const ref = db.collection(COLLECTION_MAP.EXCHANGE_ITEM).doc(id);
    const snapshot = await ref.get();
    const doc = snapshot.data();
    if (!doc) {
      return null;
    }
    const data = new ExchangeItem(doc);

    if (user.data.role === UserRole.USER && !data.isAvailable) {
      throw new AppError(404, "EXCHANGE.ITEM_NOT_FOUND");
    }

    if (withMetadata) {
      if (data.type === ExchangeItemType.VOUCHER) {
        const metaRes = await VoucherController.getVoucher(user, {
          id: data.sourceId,
        });
        if (!metaRes) {
          throw new AppError(404, "EXCHANGE.SOURCE_NOT_FOUND");
        }
        data.metadata = metaRes.data;
      } else if (data.type === ExchangeItemType.ITEM) {
        const metaRes = await InventoryItemController.getItem(user, {
          id: data.sourceId,
        });
        if (!metaRes) {
          throw new AppError(404, "EXCHANGE.SOURCE_NOT_FOUND");
        }
        data.metadata = metaRes.data;
      }
    }

    return {
      data,
      ref,
      snapshot,
    };
  }

  @wrapError
  public static async getPurchaseableItems(
    user: TGetUserRes,
    filters: TGetExchangeItems & TPaginateConstruct<ExchangeItem>,
    { withMetadata }: TGetExchangeItemOpt = {},
  ): Promise<TPaginatedPage<ExchangeItem>> {
    const { types } = filters;
    filters.construct = ExchangeItem;
    filters.addQuery = (q) => {
      if (types && types?.length > 0) {
        q = q.where("type", "in", types);
      }

      if (user.data.role === UserRole.USER) {
        q.where("isAvailable", "==", true);
      }

      return q;
    };

    const { items, pagination } = await createPage<ExchangeItem>(
      COLLECTION_MAP.EXCHANGE_ITEM,
      filters,
    );

    if (withMetadata && items.length > 0) {
      const voucherIds = items
        .filter((item) => item.type === ExchangeItemType.VOUCHER)
        .map((item) => item.sourceId);
      const inventoryItemIds = items
        .filter((item) => item.type === ExchangeItemType.ITEM)
        .map((item) => item.sourceId);

      const [vouchers, inventoryItems] = await Promise.all([
        voucherIds.length > 0
          ? getDocsByIds<Voucher>(COLLECTION_MAP.VOUCHER, voucherIds)
          : Promise.resolve([]),
        inventoryItemIds.length > 0
          ? getDocsByIds<InventoryItem>(
              COLLECTION_MAP.INVENTORY_ITEM,
              inventoryItemIds,
            )
          : Promise.resolve([]),
      ]);

      const voucherMap = new Map(vouchers.map((v) => [v.id, v]));
      const inventoryItemMap = new Map(inventoryItems.map((i) => [i.id, i]));

      items.forEach((item) => {
        if (item.type === ExchangeItemType.VOUCHER) {
          item.metadata = voucherMap.get(item.sourceId) || null;
        } else if (item.type === ExchangeItemType.ITEM) {
          item.metadata = inventoryItemMap.get(item.sourceId) || null;
        }
      });
    }

    return {
      items,
      pagination,
    };
  }

  @wrapError
  public static async addPurchaseableItem(
    user: TGetUserRes,
    data: TAddExchangeItem,
  ): Promise<ExchangeItem> {
    const docRef = db.collection(COLLECTION_MAP.EXCHANGE_ITEM).doc();

    if (data.type === ExchangeItemType.VOUCHER) {
      const voucher = await VoucherController.getVoucher(user, {
        id: data.sourceId,
      });
      if (!voucher) {
        throw new AppError(404, "VOUCHER.NOT_FOUND");
      }

      if (!voucher.data.isAvailable) {
        throw new AppError(400, "VOUCHER.NOT_AVAILABLE");
      }
    } else if (data.type === ExchangeItemType.ITEM) {
      const item = await InventoryItemController.getItem(user, {
        id: data.sourceId,
      });
      if (!item) {
        throw new AppError(404, "INVENTORY.ITEM_NOT_FOUND");
      }

      if (!item.data.isAvailable) {
        throw new AppError(400, "INVENTORY.ITEM_NOT_AVAILABLE");
      }

      if (!item.data.hasRequestedStock(data.quota ?? 0)) {
        throw new AppError(400, "INVENTORY.ITEM_EXCEEDED_STOCK");
      }
    }

    const item = new ExchangeItem({ ...data, id: docRef.id });
    await docRef.set(item.toObject());

    return item;
  }

  @wrapError
  public static async deletePurchaseableItem(
    user: TGetUserRes,
    { id }: TDeleteExchangeItem,
  ): Promise<void> {
    const item = await this.getPurchaseableItem(user, { id });

    if (!item) {
      throw new AppError(404, "EXCHANGE.ITEM_NOT_FOUND");
    }

    await db.collection(COLLECTION_MAP.EXCHANGE_ITEM).doc(id).delete();
  }

  @wrapError
  public static async getAvailableItemByIds(
    ids: string[],
  ): Promise<ExchangeItem[]> {
    return getDocsByIds<ExchangeItem>(COLLECTION_MAP.EXCHANGE_ITEM, ids, {
      addQuery: (q) => q.where("isAvailable", "==", true),
      construct: ExchangeItem,
    });
  }

  @wrapError
  public static async txGetItem(
    id: string,
    tx: Transaction,
  ): Promise<TGetExchangeItemRes> {
    const ref = db.collection(COLLECTION_MAP.EXCHANGE_ITEM).doc(id);
    const snapshot = await tx.get(ref);
    if (!snapshot.exists) {
      throw new AppError(404, "EXCHANGE.TRANSACTION_ITEM_NOT_FOUND");
    }
    const data = new ExchangeItem({ ...snapshot.data() });

    return {
      data,
      ref,
      snapshot,
    };
  }

  @wrapError
  public static async txUpdateStock(
    item: TGetExchangeItemRes,
    qty: number,
    tx: Transaction,
  ): Promise<void> {
    if (!item.data.hasRequestedStock(qty)) {
      throw new AppError(400, "EXCHANGE.TRANSACTION_ITEM_OUT_OF_STOCK");
    }
    tx.update(item.ref, { quota: item.data.decrease(qty) });
  }
}
