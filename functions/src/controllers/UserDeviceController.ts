import COLLECTION_MAP from "../constant/db";
import { wrapError } from "../utils/decorator/wrapError";
import AppError from "../utils/formatter/AppError";
import { TGetUserRes } from "../dto/user";
import { TRemoveUserDevice, TSaveUserDevice } from "../dto/userDevice";
import UserDevice from "../models/userDevice";

export class UserDeviceController {
  @wrapError
  public static async getDevices(user: TGetUserRes): Promise<UserDevice[]> {
    const snapshot = await user.ref
      .collection(COLLECTION_MAP.USER_DEVICE)
      .get();

    const devices: UserDevice[] = [];
    snapshot.forEach((doc) => {
      devices.push(new UserDevice({ ...doc.data() }));
    });

    return devices;
  }

  @wrapError
  public static async saveDevice(
    user: TGetUserRes,
    data: TSaveUserDevice,
  ): Promise<UserDevice> {
    const result = await user.ref
      .collection(COLLECTION_MAP.USER_DEVICE)
      .where("deviceToken", "==", data.deviceToken)
      .get();

    if (result.empty) {
      const docRef = user.ref.collection(COLLECTION_MAP.USER_DEVICE).doc();

      const device = new UserDevice({ ...data, id: docRef.id });
      device.extractType();

      await docRef.set(device.toObject());

      return device;
    } else {
      const snapshot = result.docs[0];
      const device = new UserDevice(snapshot.data());
      device.fcmToken = data.fcmToken;
      device.updatedAt = new Date();

      await user.ref
        .collection(COLLECTION_MAP.USER_DEVICE)
        .doc(device.id)
        .update(device.toObject());
      return device;
    }
  }

  @wrapError
  public static async removeDevice(
    user: TGetUserRes,
    { id }: TRemoveUserDevice,
  ): Promise<void> {
    const device = await user.ref
      .collection(COLLECTION_MAP.USER_DEVICE)
      .doc(id)
      .get();

    if (!device.exists) {
      throw new AppError(404, "USER_DEVICE.NOT_FOUND");
    }

    await user.ref.collection(COLLECTION_MAP.USER_DEVICE).doc(id).delete();
  }
}
