import { wrapError } from "../utils/decorator/wrapError";
import LogisticOrder, { LogisticOrderStatus } from "../models/LogisticOrder";
import FcmMessaging from "../utils/firebase/fcmMessaging";
import { UserController } from "./UserController";
import { TSubmittedDropoffNotifPayload } from "../dto/messaging";

export class MessagingController {
  @wrapError
  public static async DropoffNotif(order: LogisticOrder): Promise<void> {
    const maker = await UserController.getUser({ id: order.maker }, { withDevices: true });
    const makerTokens: string[] = [];
    if (maker) {
      makerTokens.push(...maker.data.getFcmTokens()); 
    }
    const admins = await UserController.getAdmins({ withDevices: true });
    const adminTokens = admins.flatMap((admin) =>
      admin.getFcmTokens(),
    );

    switch (order.status) {
      case LogisticOrderStatus.SUBMITTED: {
        if (adminTokens.length > 0) {
          new FcmMessaging<TSubmittedDropoffNotifPayload>(
            {
              title: "New Dropoff Request",
              body: `${maker?.data.displayName} just created a new dropoff request`,
              customData: {
                orderId: order.id,
              },
            },
            ...adminTokens,
          ).send();
        }

        break;
      }
      case LogisticOrderStatus.COMPLETED: {
        if (adminTokens.length > 0) {
          new FcmMessaging<TSubmittedDropoffNotifPayload>(
            {
              title: "Your Dropoff Request Completed",
              body: `You just received ${order.totalPoint} points`,
              customData: {
                orderId: order.id,
              },
            },
            ...makerTokens,
          ).send();
        }

        break;
      }
      case LogisticOrderStatus.REJECTED: {
        if (adminTokens.length > 0) {
          new FcmMessaging<TSubmittedDropoffNotifPayload>(
            {
              title: "Your Dropoff Request Was Rejected",
              body: "Your request just rejected, click to view this issue",
              customData: {
                orderId: order.id,
              },
            },
            ...makerTokens,
          ).send();
        }

        break;
      }
    }
  }
}
