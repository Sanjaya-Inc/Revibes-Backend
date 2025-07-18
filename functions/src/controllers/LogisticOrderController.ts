import COLLECTION_MAP from "./../constant/db";
import {
  TAddLogisticItem,
  TAddLogisticItemMedia,
  TAddLogisticItemMediaRes,
  TDeleteLogisticItem,
  TGetLogisticItem,
  TGetLogisticItemRes,
  TGetLogisticItems,
} from "../dto/logisticItem";
import {
  TCompleteLogisticOrder,
  TDeleteLogisticOrder,
  TEstimateLogisticOrderPoint,
  TEstimateLogisticOrderPointRes,
  TGetLogisticOrder,
  TGetLogisticOrderRes,
  TGetLogisticOrders,
  TRejectLogisticOrder,
  TSubmitLogisticOrder,
} from "../dto/logisticOrder";
import LogisticItem, { TLogisticItemData } from "../models/LogisticItem";
import LogisticOrder, {
  LogisticOrderStatus,
  LogisticOrderType,
  TLogisticOrderData,
} from "../models/LogisticOrder";
import { LogisticOrderHistory } from "../models/LogisticOrderHistory";
import User, { UserRole } from "../models/User";
import { wrapError } from "../utils/decorator/wrapError";
import {
  BasePath,
  db,
  generateId,
  getFileStorageInstance,
} from "../utils/firebase";
import AppError from "../utils/formatter/AppError";
import {
  createPage,
  TPaginateConstruct,
  TPaginatedPage,
} from "../utils/pagination";
import { AppSettingController } from "./AppSettingController";
import { CountryController } from "./CountryController";
import { NotificationController } from "./NotificationController";
import { StoreBranchController } from "./StoreBranchController";
import StoreBranch from "../models/StoreBranch";

export type TGetLogisticOrderOpt = {
  withStore?: boolean;
  withItems?: boolean;
  withHistories?: boolean;
};

export type TGetLogisticOrderItemOpt = {
  withOrder?: boolean;
};

export class LogisticOrderController {
  @wrapError
  public static async getOrder(
    user: User,
    { id }: TGetLogisticOrder,
    { withItems, withHistories, withStore }: TGetLogisticOrderOpt = {},
  ): Promise<TGetLogisticOrderRes | null> {
    const orderRef = db.collection(COLLECTION_MAP.LOGISTIC_ORDER).doc(id);

    const orderSnapshot = await orderRef.get();
    const orderDoc = orderSnapshot.data();
    if (!orderDoc) {
      return null;
    }

    if (user.role !== UserRole.ADMIN && orderDoc.maker !== user.id) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const logisticOrder = new LogisticOrder(orderDoc);

    if (withItems) {
      // Get subcollection of logistic_item
      const itemsSnapshot = await orderRef
        .collection(COLLECTION_MAP.LOGISTIC_ITEM)
        .get();

      logisticOrder.items = itemsSnapshot.docs.map(
        (doc) => new LogisticItem(doc.data()),
      );
    }

    if (withHistories) {
      // Get subcollection of logistic_item
      const historiesSnapshot = await orderRef
        .collection(COLLECTION_MAP.LOGISTIC_ORDER_HISTORY)
        .get();

      logisticOrder.histories = historiesSnapshot.docs.map(
        (doc) => new LogisticOrderHistory(doc.data()),
      );
    }

    if (withStore && logisticOrder.storeLocation) {
      const storeSnapshot = await db
        .collection(COLLECTION_MAP.STORE_BRANCH)
        .doc(logisticOrder.storeLocation)
        .get();
      const storeDoc = storeSnapshot.data();
      if (storeDoc) {
        logisticOrder.store = new StoreBranch(storeDoc);
      }
    }

    return {
      data: logisticOrder,
      ref: orderRef,
      snapshot: orderSnapshot,
    };
  }

  @wrapError
  public static async addOrder(user: User): Promise<string> {
    const docRef = db.collection(COLLECTION_MAP.LOGISTIC_ORDER).doc();
    const data: TLogisticOrderData = {
      id: docRef.id,
      maker: user.id,
      status: LogisticOrderStatus.DRAFT,
    };

    const logisticOrder = new LogisticOrder(data);

    await docRef.set(logisticOrder.toObject());

    return docRef.id;
  }

  @wrapError
  public static async getOrders(
    user: User,
    filters: TGetLogisticOrders & TPaginateConstruct<LogisticOrder>,
    { withItems, withHistories, withStore }: TGetLogisticOrderOpt = {},
  ): Promise<TPaginatedPage<LogisticOrder>> {
    const { statuses } = filters;
    filters.construct = LogisticOrder;
    filters.addQuery = (q) => {
      if (statuses && statuses?.length > 0) {
        q = q.where("status", "in", statuses);
      }

      if (user.role == UserRole.USER) {
        q = q.where("maker", "==", user.id);
      }

      return q;
    };

    const { items, pagination } = await createPage<LogisticOrder>(
      COLLECTION_MAP.LOGISTIC_ORDER,
      filters,
    );

    await Promise.all(
      items.map(async (order) => {
        if (withItems) {
          const itemSnapshots = await db
            .collection(COLLECTION_MAP.LOGISTIC_ORDER)
            .doc(order.id)
            .collection(COLLECTION_MAP.LOGISTIC_ITEM)
            .get();

          order.items = itemSnapshots.docs.map(
            (doc) => new LogisticItem(doc.data()),
          );
        }

        if (withHistories) {
          // Get subcollection of logistic_item
          const historiesSnapshot = await db
            .collection(COLLECTION_MAP.LOGISTIC_ORDER)
            .doc(order.id)
            .collection(COLLECTION_MAP.LOGISTIC_ORDER_HISTORY)
            .get();

          order.histories = historiesSnapshot.docs.map(
            (doc) => new LogisticOrderHistory(doc.data()),
          );
        }

        if (withStore && order.storeLocation) {
          const storeSnapshot = await db
            .collection(COLLECTION_MAP.STORE_BRANCH)
            .doc(order.storeLocation)
            .get();
          const storeDoc = storeSnapshot.data();
          if (storeDoc) {
            order.store = new StoreBranch(storeDoc);
          }
        }
      }),
    );

    return {
      items: items,
      pagination,
    };
  }

  @wrapError
  public static async estimateOrderPoint(
    data: TEstimateLogisticOrderPoint,
  ): Promise<TEstimateLogisticOrderPointRes> {
    const setting = await AppSettingController.getSetting();

    let total = 0;
    const items: Record<string, number> = {};
    data.items.forEach((item, i) => {
      const newItem = new LogisticItem(item);
      const point = newItem.calculatePoint(setting);
      items[i.toString()] = point;
      total += point;
    });

    return { items, total };
  }

  @wrapError
  public static async saveOrder(
    user: User,
    data: TSubmitLogisticOrder,
  ): Promise<void> {
    const orderRef = db.collection(COLLECTION_MAP.LOGISTIC_ORDER).doc(data.id);

    const orderSnapshot = await orderRef.get();
    const orderDoc = orderSnapshot.data();
    if (!orderDoc) {
      throw new AppError(404, "LOGISTIC_ORDER.NOT_FOUND");
    }

    const order = new LogisticOrder(orderDoc);

    if (order.maker !== user.id) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    if (order.status !== LogisticOrderStatus.DRAFT) {
      throw new AppError(403, "LOGISTIC_ORDER.CANNOT_CHANGE_NON_DRAFT");
    }

    const country = await CountryController.getCountry({ code: data.country });
    if (!country) {
      throw new AppError(404, "COUNTRY.NOT_FOUND");
    }

    if (data.type === LogisticOrderType.DROP_OFF) {
      const { storeLocation } = data;
      const store = await StoreBranchController.getStoreBranch({
        id: storeLocation,
      });
      if (!store) {
        throw new AppError(404, "STORE.NOT_FOUND");
      }
      order.storeLocation = storeLocation;
    } else {
      const { address, addressDetail, postalCode } = data;
      order.address = address;
      order.addressDetail = addressDetail;
      order.postalCode = postalCode;
    }

    order.type = data.type;
    order.name = data.name;
    order.country = data.country;
    order.updatedAt = new Date();

    if (Array.isArray(data.items) && data.items.length > 0) {
      const batch = db.batch();

      // Update order document
      batch.update(
        db.collection(COLLECTION_MAP.LOGISTIC_ORDER).doc(data.id),
        order.toObject(),
      );

      for (const item of data.items) {
        // Fetch the latest item data from Firestore
        const getItemRes = await this.getOrderItem(user, {
          logisticOrderId: order.id,
          logisticOrderItemId: item.id,
        });
        if (!getItemRes) {
          throw new AppError(404, "LOGISTIC_ORDER.ITEM_NOT_FOUND");
        }

        let dbItem = new LogisticItem(item);
        if (getItemRes.data) {
          dbItem = new LogisticItem({
            ...getItemRes.data.toObject(),
            ...item,
          });
        }

        batch.set(getItemRes.ref, { ...dbItem.toObject() }, { merge: true });
      }
      await batch.commit();
    }
  }

  @wrapError
  public static async submitOrder(
    user: User,
    data: TSubmitLogisticOrder,
  ): Promise<void> {
    const orderRes = await this.getOrder(
      user,
      { id: data.id },
      { withItems: true },
    );
    if (!orderRes) {
      throw new AppError(404, "LOGISTIC_ORDER.NOT_FOUND");
    }

    const { data: order, ref: orderRef } = orderRes;

    if (order.maker !== user.id) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    if (order.status !== LogisticOrderStatus.DRAFT) {
      throw new AppError(403, "LOGISTIC_ORDER.CANNOT_SUBMIT_NON_DRAFT");
    }

    const country = await CountryController.getCountry({ code: data.country });
    if (!country) {
      throw new AppError(404, "COUNTRY.NOT_FOUND");
    }

    if (data.type === LogisticOrderType.DROP_OFF) {
      const { storeLocation } = data;
      const store = await StoreBranchController.getStoreBranch({
        id: storeLocation,
      });
      if (!store) {
        throw new AppError(404, "STORE.NOT_FOUND");
      }
      order.storeLocation = storeLocation;
    } else {
      const { address, addressDetail, postalCode } = data;
      order.address = address;
      order.addressDetail = addressDetail;
      order.postalCode = postalCode;
    }

    order.type = data.type;
    order.name = data.name;
    order.country = data.country;
    order.updatedAt = new Date();

    order.status = LogisticOrderStatus.SUBMITTED;

    const batch = db.batch();

    // Update order document
    batch.update(db.collection(COLLECTION_MAP.LOGISTIC_ORDER).doc(data.id), {
      type: order.type,
      updatedAt: order.updatedAt,
      name: order.name,
      country: order.country,
      address: order.address,
      addressDetail: order.addressDetail,
      postalCode: order.postalCode,
      storeLocation: order.storeLocation,
      status: order.status,
      totalPoint: order.totalPoint,
    });

    // saved order items on database
    const { items } = order;

    // update submitted items
    for (const item of data.items) {
      const itemRecord = items.find((i) => i.id === item.id);
      if (!itemRecord) {
        throw new AppError(404, "LOGISTIC_ORDER.ITEM_NOT_FOUND");
      }

      let dbItem = new LogisticItem(item);
      if (itemRecord) {
        dbItem = new LogisticItem({
          ...itemRecord.toObject(),
          ...item,
        });
      }

      // Remove media files from Firestore item if they do not exist in Firebase Storage
      if (Array.isArray(dbItem.media) && dbItem.media.length > 0) {
        const storageInstance = getFileStorageInstance();
        const mediaChecks = dbItem.media.map(async (media) => {
          // Assume media.downloadUri is the storage path
          const exists = await storageInstance.fileExists(media.downloadUri);
          if (exists) {
            return media;
          }
          return null;
        });
        const checkedMedia = await Promise.all(mediaChecks);
        const validMedia = checkedMedia.filter((media) => media !== null);
        if (validMedia.length !== dbItem.media.length) {
          dbItem.media = validMedia;
        }
      }

      const itemRef = db
        .collection(COLLECTION_MAP.LOGISTIC_ORDER)
        .doc(order.id)
        .collection(COLLECTION_MAP.LOGISTIC_ITEM)
        .doc(itemRecord.id);
      batch.set(itemRef, { ...dbItem.toObject() }, { merge: true });
    }

    // Delete not submitted items
    const submittedItemIds = data.items.map((i) => i.id);
    for (const item of items.filter((i) => !submittedItemIds.includes(i.id))) {
      // Remove media files from Firestore item if they do not exist in Firebase Storage
      if (Array.isArray(item.media) && item.media.length > 0) {
        const storageInstance = getFileStorageInstance();
        storageInstance.removeFolder(BasePath.LOGISTIC, order.id, "items");
      }

      const itemRef = db
        .collection(COLLECTION_MAP.LOGISTIC_ORDER)
        .doc(order.id)
        .collection(COLLECTION_MAP.LOGISTIC_ITEM)
        .doc(item.id);
      batch.delete(itemRef);
    }

    // add history
    const historyDoc = orderRef
      .collection(COLLECTION_MAP.LOGISTIC_ORDER_HISTORY)
      .doc();
    const newHistory = new LogisticOrderHistory({
      id: historyDoc.id,
      status: LogisticOrderStatus.SUBMITTED,
      timestamp: new Date(),
    });
    batch.create(historyDoc, newHistory.toObject());

    await batch.commit();

    NotificationController.Dropoff(order);
  }

  @wrapError
  public static async rejectOrder(
    user: User,
    data: TRejectLogisticOrder,
  ): Promise<void> {
    const orderRes = await this.getOrder(
      user,
      { id: data.id },
      { withItems: true },
    );
    if (!orderRes) {
      throw new AppError(404, "LOGISTIC_ORDER.NOT_FOUND");
    }

    const { data: order, ref: orderRef } = orderRes;

    if (![LogisticOrderStatus.SUBMITTED].includes(order.status)) {
      throw new AppError(403, "LOGISTIC_ORDER.CANNOT_REJECT_ORDER");
    }

    order.status = LogisticOrderStatus.REJECTED;
    order.updatedAt = new Date();

    const batch = db.batch();

    // Update order document
    batch.update(orderRef, {
      status: order.status,
      updatedAt: order.updatedAt,
    });

    let meta = null;
    if (data.reason) {
      meta = {
        reason: data.reason,
      };
    }

    // add history
    const historyDoc = orderRef
      .collection(COLLECTION_MAP.LOGISTIC_ORDER_HISTORY)
      .doc();
    const newHistory = new LogisticOrderHistory({
      id: historyDoc.id,
      status: order.status,
      timestamp: new Date(),
      meta,
    });
    batch.create(historyDoc, newHistory.toObject());

    await batch.commit();

    NotificationController.Dropoff(order);
  }

  @wrapError
  public static async completeOrder(
    user: User,
    data: TCompleteLogisticOrder,
  ): Promise<void> {
    const orderRes = await this.getOrder(
      user,
      { id: data.id },
      { withItems: true },
    );
    if (!orderRes) {
      throw new AppError(404, "LOGISTIC_ORDER.NOT_FOUND");
    }

    const { data: order, ref: orderRef } = orderRes;

    if (![LogisticOrderStatus.SUBMITTED].includes(order.status)) {
      throw new AppError(403, "LOGISTIC_ORDER.CANNOT_COMPLETE_ORDER");
    }

    let orderPoint = 0;
    const setting = await AppSettingController.getSetting();
    if (data.customTotalPoint) {
      orderPoint = data.customTotalPoint;
    } else if (data.customPoints && data.customPoints?.length > 0) {
      for (const item of order.items) {
        const customPoint = data.customPoints.find((i) => i.id === item.id);
        if (customPoint) {
          item.point = customPoint?.point;
          orderPoint += item.point;
        }
      }
    } else {
      for (const item of order.items) {
        orderPoint += item.calculatePoint(setting);
      }
    }

    order.status = LogisticOrderStatus.COMPLETED;
    order.totalPoint = orderPoint;
    order.updatedAt = new Date();

    const batch = db.batch();

    // Update order document
    batch.update(orderRef, {
      status: order.status,
      totalPoint: order.totalPoint,
      updatedAt: order.updatedAt,
    });

    order.items.forEach((item) => {
      const itemRef = orderRef
        .collection(COLLECTION_MAP.LOGISTIC_ITEM)
        .doc(item.id);
      batch.update(itemRef, {
        point: item.point,
      });
    });

    // Update user points
    const userRef = db.collection(COLLECTION_MAP.USER).doc(order.maker);
    batch.update(userRef, {
      points: user.addPoint(orderPoint),
    });

    const meta = null;

    // add history
    const historyDoc = orderRef
      .collection(COLLECTION_MAP.LOGISTIC_ORDER_HISTORY)
      .doc();
    const newHistory = new LogisticOrderHistory({
      id: historyDoc.id,
      status: order.status,
      timestamp: new Date(),
      meta,
    });
    batch.create(historyDoc, newHistory.toObject());

    await batch.commit();

    NotificationController.Dropoff(order);
  }

  @wrapError
  public static async deleteOrder(
    user: User,
    { id }: TDeleteLogisticOrder,
  ): Promise<void> {
    const orderSnapshot = await db
      .collection(COLLECTION_MAP.LOGISTIC_ORDER)
      .doc(id)
      .get();
    const orderDoc = orderSnapshot.data();
    if (!orderDoc) {
      throw new AppError(404, "LOGISTIC_ORDER.NOT_FOUND");
    }

    if (user.role !== UserRole.ADMIN || orderDoc.maker !== user.id) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    // Check if the order is in draft status
    if (orderDoc.status !== LogisticOrderStatus.DRAFT) {
      throw new AppError(400, "LOGISTIC_ORDER.CANNOT_DELETE_NON_DRAFT");
    }

    // Delete all files in Firebase Storage related to this order
    await Promise.all([
      getFileStorageInstance().removeFolder(BasePath.LOGISTIC, id),
      db.collection(COLLECTION_MAP.LOGISTIC_ORDER).doc(id).delete(),
    ]);
  }

  @wrapError
  public static async addOrderItem(
    user: User,
    { logisticOrderId }: TAddLogisticItem,
  ): Promise<string> {
    const result = await this.getOrder(user, { id: logisticOrderId });
    if (!result) {
      throw new AppError(404, "LOGISTIC_ORDER.NOT_FOUND");
    }

    const docRef = result.ref.collection(COLLECTION_MAP.LOGISTIC_ITEM).doc();
    const data: TLogisticItemData = {
      id: docRef.id,
    };

    const orderItem = new LogisticItem(data);

    await docRef.set(orderItem.toObject());

    return docRef.id;
  }

  @wrapError
  public static async getOrderItems(
    user: User,
    { logisticOrderId }: TGetLogisticItems,
  ): Promise<LogisticItem[]> {
    const order = await this.getOrder(
      user,
      { id: logisticOrderId },
      { withItems: true },
    );

    if (!order) {
      throw new AppError(404, "LOGISTIC_ORDER.NOT_FOUND");
    }

    return order.data.items;
  }

  @wrapError
  public static async getOrderItem(
    user: User,
    { logisticOrderId, logisticOrderItemId }: TGetLogisticItem,
    { withOrder }: TGetLogisticOrderItemOpt = {},
  ): Promise<TGetLogisticItemRes | null> {
    const order = await this.getOrder(user, { id: logisticOrderId });
    if (!order) {
      throw new AppError(404, "LOGISTIC_ORDER.NOT_FOUND");
    }

    if (order.data.maker !== user.id) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const logisticItemRef = order.ref
      .collection(COLLECTION_MAP.LOGISTIC_ITEM)
      .doc(logisticOrderItemId);

    const logisticItemSnapshot = await logisticItemRef.get();

    const orderItemDoc = logisticItemSnapshot.data();
    if (!orderItemDoc) {
      return null;
    }
    const logisticItem = new LogisticItem(orderItemDoc);
    let data: TGetLogisticItemRes = {
      data: logisticItem,
      ref: logisticItemRef,
      snapshot: logisticItemSnapshot,
    };

    if (withOrder) {
      data = {
        ...data,
        order,
      };
    }

    return data;
  }

  @wrapError
  public static async deleteOrderItem(
    user: User,
    { logisticOrderId, logisticOrderItemId }: TDeleteLogisticItem,
  ): Promise<void> {
    const result = await this.getOrderItem(
      user,
      {
        logisticOrderId,
        logisticOrderItemId,
      },
      { withOrder: true },
    );

    if (!result || !result.order?.ref) {
      throw new AppError(404, "LOGISTIC_ORDER.ITEM_NOT_FOUND");
    }

    if (
      user.role !== UserRole.ADMIN ||
      result?.order?.data?.maker !== user.id
    ) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    await Promise.all([
      getFileStorageInstance().removeFolder(
        BasePath.LOGISTIC,
        logisticOrderId,
        "items",
        logisticOrderItemId,
      ),
      result?.order?.ref
        .collection(COLLECTION_MAP.LOGISTIC_ITEM)
        .doc(result.data.id)
        .delete(),
    ]);
  }

  @wrapError
  public static async addOrderItemMedia(
    user: User,
    {
      logisticOrderId,
      logisticOrderItemId,
      contentType,
    }: TAddLogisticItemMedia,
  ): Promise<TAddLogisticItemMediaRes> {
    const result = await this.getOrderItem(
      user,
      {
        logisticOrderId,
        logisticOrderItemId,
      },
      { withOrder: true },
    );

    const order = result?.order;
    if (!result?.data || !order?.data) {
      throw new AppError(404, "LOGISTIC_ORDER.ITEM_NOT_FOUND");
    }

    if (order.data?.status !== LogisticOrderStatus.DRAFT) {
      throw new AppError(400, "LOGISTIC_ORDER.CANNOT_ADD_MEDIA_NON_DRAFT");
    }

    const fileId = generateId();
    const storageInstance = getFileStorageInstance();
    const [uploadUrl, downloadUri, expiredAt] =
      await storageInstance.getSignedUrl(
        contentType,
        BasePath.LOGISTIC,
        logisticOrderId,
        "items",
        fileId,
      );

    const logisticItem = new LogisticItem(result.data);

    if (!Array.isArray(logisticItem.media)) {
      logisticItem.media = [];
    }

    logisticItem.media.push({
      uploadUrl,
      downloadUri,
      expiredAt,
    });

    await db
      .collection(COLLECTION_MAP.LOGISTIC_ORDER)
      .doc(logisticOrderId)
      .collection(COLLECTION_MAP.LOGISTIC_ITEM)
      .doc(logisticOrderItemId)
      .set(logisticItem.toObject(), { merge: true });

    const downloadUrl = await storageInstance.getFullUrl(downloadUri);

    return {
      uploadUrl,
      downloadUrl: downloadUrl,
      expiredAt,
    };
  }
}
