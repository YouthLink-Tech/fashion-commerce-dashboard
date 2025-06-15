import { placeBahokOrder } from "./bahok";
import { placePathaoOrder } from "./pathao";
import { placeRedXOrder } from "./redx";
import { placeSteadfastOrder } from "./steadfast";

export const placeShipmentOrder = async (handler, order) => {
  const name = handler?.shipmentHandlerName?.toLowerCase();

  switch (name) {
    case "steadfast":
      return await placeSteadfastOrder(order);

    case "pathao":
      return await placePathaoOrder(order);

    case "bahok":
      return await placeBahokOrder(order);

    case "redx":
      return await placeRedXOrder(order);

    // case "sundarban":
    //   return await placeSundarbanOrder(order);

    default:
      throw new Error(`${name} API is not integrated yet.`);
  }
};
