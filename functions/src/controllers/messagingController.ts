import { wrapError } from "../utils/decorator/wrapError";
import LogisticOrder, { LogisticOrderStatus } from "../models/LogisticOrder";
import FcmMessaging from "../utils/firebase/fcmMessaging";
import { UserController } from "./UserController";
import { TSubmittedDropoffNotifPayload } from "../dto/messaging";

export class MessagingController {
  @wrapError
  public static async DropoffNotif(order: LogisticOrder): Promise<void> {
    const maker = await UserController.getUser({ id: order.maker });
    const admins = await UserController.getAdmins({ withDevices: true });
    const adminTokens = admins.flatMap((admin) =>
      admin.devices.map((device) => device.fcmToken),
    );

    switch (order.status) {
      case LogisticOrderStatus.SUBMITTED: {
        new FcmMessaging<TSubmittedDropoffNotifPayload>(
        {
            title: "New Dropoff Request",
            body: `${maker?.displayName} just created a new dropoff request`,
          customData: {
              orderId: order.id,
          },
          },
          ...adminTokens,
        ).send();
        break;
      }
    }
  }
}
