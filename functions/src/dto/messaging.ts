import { NotificationType } from "../constant/notificationType";
import {
  LogisticOrderStatus,
  LogisticOrderType,
} from "../models/LogisticOrder";

export type TSubmittedDropoffNotifPayload = {
  type: NotificationType;
  orderType: LogisticOrderType;
  orderId: string;
  status: LogisticOrderStatus;
};
