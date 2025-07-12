import admin from "firebase-admin";
import {
  BatchResponse,
  Messaging,
  MulticastMessage,
} from "firebase-admin/messaging";

export type TMessage<T> = {
  imageUrl?: string;
  title: string;
  body: string;
  customData?: T;
};

export class FcmMessaging<T> {
  private readonly messaging: Messaging;
  private recipients: string[] = [];
  private message: TMessage<T> = {
    title: "",
    body: "",
  };

  constructor(msg: TMessage<T>, ...recipients: string[]) {
    this.messaging = admin.messaging();

    this.setMessage(msg);
    this.setRecipients(...recipients);
  }

  public addRecipients(...fcmTokens: string[]) {
    this.recipients.push(...fcmTokens);
    return this;
  }

  public setRecipients(...fcmTokens: string[]) {
    this.recipients = fcmTokens;
    return this;
  }

  public setMessage(msg: TMessage<T>) {
    this.message = msg;
    return this;
  }

  public async send(): Promise<BatchResponse> {
    const msg = this.constructPayload();
    return await this.messaging.sendEachForMulticast(msg);
  }

  private constructPayload(): MulticastMessage {
    const { title, body, imageUrl, customData } = this.message;
    const message: MulticastMessage = {
      tokens: this.recipients,
      notification: {
        title,
        body,
        ...(imageUrl && { imageUrl: imageUrl }), // Conditionally add imageUrl if provided
      },
      data: customData || {}, // Add custom data if provided, otherwise an empty object
      // You can add more options here, e.g.,
      // apns: {
      //   payload: {
      //     aps: {
      //       sound: 'default' // For iOS
      //     }
      //   }
      // },
      // android: {
      //   priority: 'high' // For Android
      // }
    };

    return message;
  }
}

export default FcmMessaging;
