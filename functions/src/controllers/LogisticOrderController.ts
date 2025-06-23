import COLLECTION_MAP from "../constant/db";
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
  TDeleteLogisticOrder,
  TGetLogisticOrder,
  TGetLogisticOrderRes,
  TSubmitLogisticOrder,
} from "../dto/logisticOrder";
import LogisticItem, { TLogisticItemData } from "../models/LogisticItem";
import LogisticOrder, {
  LogisticOrderStatus,
  TLogisticOrderData,
} from "../models/LogisticOrder";
import User, { UserRole } from "../models/User";
import { wrapError } from "../utils/decorator/wrapError";
import {
  BasePath,
  db,
  generateId,
  getFileStorageInstance,
} from "../utils/firebase";
import AppError from "../utils/formatter/AppError";

export type TGetLogisticOrderOpt = {
  withItems?: boolean;
};

export type TGetLogisticOrderItemOpt = {
  withOrder?: boolean;
};

export class LogisticOrderController {
  @wrapError
  public static async getOrder(
    user: User,
    { id }: TGetLogisticOrder,
    { withItems = false }: TGetLogisticOrderOpt = {},
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

    const logisticOrder = new LogisticOrder(orderDoc).getDetailFields();

    if (withItems) {
      // Get subcollection of logistic_item
      const itemsSnapshot = await orderRef
        .collection(COLLECTION_MAP.LOGISTIC_ITEM)
        .get();
      const logisticItems = itemsSnapshot.docs.map((doc) => doc.data());
      logisticOrder.assignItems(logisticItems);
    }

    return {
      logisticOrder,
      logisticOrderRef: orderRef,
      logisticOrderSnapshot: orderSnapshot,
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
  public static async submitOrder(
    user: User,
    data: TSubmitLogisticOrder,
  ): Promise<void> {
    const orderSnapshot = await db
      .collection(COLLECTION_MAP.LOGISTIC_ORDER)
      .doc(data.id)
      .get();
    const orderDoc = orderSnapshot.data();
    if (!orderDoc) {
      throw new AppError(404, "LOGISTIC_ORDER.NOT_FOUND");
    }

    if (orderDoc.maker !== user.id) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const order = new LogisticOrder(orderDoc);
    order.status = LogisticOrderStatus.SUBMITTED;
    await db
      .collection(COLLECTION_MAP.LOGISTIC_ORDER)
      .doc(data.id)
      .update(order.toObject());
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

    const docRef = result.logisticOrderRef
      .collection(COLLECTION_MAP.LOGISTIC_ITEM)
      .doc();
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

    return order.logisticOrder.items;
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

    if (order.logisticOrder.maker !== user.id) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const logisticItemRef = db
      .collection(COLLECTION_MAP.LOGISTIC_ITEM)
      .doc(logisticOrderItemId);

    const logisticItemSnapshot = await logisticItemRef.get();

    const orderItemDoc = logisticItemSnapshot.data();
    if (!orderItemDoc) {
      return null;
    }
    const logisticItem = new LogisticItem(orderItemDoc);
    let data: TGetLogisticItemRes = {
      logisticItem,
      logisticItemRef,
      logisticItemSnapshot,
    };

    if (withOrder) {
      data = {
        ...data,
        ...order,
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

    if (!result) {
      throw new AppError(404, "LOGISTIC_ORDER.ITEM_NOT_FOUND");
    }

    if (
      user.role !== UserRole.ADMIN ||
      result.logisticOrder?.maker !== user.id
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
      db
        .collection(COLLECTION_MAP.LOGISTIC_ORDER)
        .doc(result.logisticItem.id)
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
    const result = await this.getOrderItem(user, {
      logisticOrderId,
      logisticOrderItemId,
    });

    if (!result) {
      throw new AppError(404, "LOGISTIC_ORDER.ITEM_NOT_FOUND");
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

    const logisticItem = result.logisticItem;

    logisticItem.media?.push({
      uploadUrl,
      downloadUri,
      expiredAt,
    });

    await db
      .collection(COLLECTION_MAP.LOGISTIC_ORDER)
      .doc(logisticOrderId)
      .collection(COLLECTION_MAP.LOGISTIC_ITEM)
      .doc(logisticOrderItemId)
      .set(logisticItem, { merge: true });

    const downloadUrl = storageInstance.getFullUrl(downloadUri);

    return {
      uploadUrl,
      downloadUrl,
    };
  }
}
