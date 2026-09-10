import AppSetting from "./AppSetting";
import LogisticItem from "./LogisticItem";

export type TCustomItemPoint = {
  id: string;
  point: number;
};

export function resolveOrderPoint(
  items: LogisticItem[],
  setting: AppSetting,
  customTotalPoint?: number,
  customPoints?: TCustomItemPoint[],
): number {
  if (customTotalPoint != null) {
    return customTotalPoint;
  }

  if (customPoints && customPoints.length > 0) {
    let orderPoint = 0;
    for (const item of items) {
      const customPoint = customPoints.find((entry) => entry.id === item.id);
      if (customPoint) {
        item.point = customPoint.point;
        orderPoint += item.point;
      }
    }
    return orderPoint;
  }

  return items.reduce(
    (total, item) => total + item.calculatePoint(setting),
    0,
  );
}
