import { getPathaoToken } from "@/app/lib/pathao/pathaoClient";
import { calculateWeight, lookupCityId, lookupZoneId } from "@/app/lib/pathao/pathaoHelpers";
import { authOptions } from "@/app/utils/Provider/authOptions";
import { getServerSession } from "next-auth";

export async function POST(request) {

  const session = await getServerSession(authOptions);

  if (!session || !session.user?.accessToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const order = await request.json();
    const deliveryType = order.deliveryInfo?.deliveryMethod === 'EXPRESS' ? 12 : 48;
    const token = await getPathaoToken();  // ensures token valid
    const cityId = await lookupCityId(order.deliveryInfo.city);
    const itemWeight = await calculateWeight(order.productInformation);
    // const zoneGuess =
    //   order.deliveryInfo.address2?.split(",")[0]?.trim() ||  // best match
    //   order.deliveryInfo.address1?.split(",")[0]?.trim();     // fallback
    // const zoneId = await lookupZoneId(cityId, zoneGuess);

    const payload = {
      store_id: process.env.PATHAO_STORE_ID,
      merchant_order_id: order.orderNumber,
      recipient_name: order.customerInfo.customerName,
      recipient_phone: order.customerInfo.phoneNumber,
      recipient_address: `${order.deliveryInfo.address1}, ${order.deliveryInfo.address2}`,
      recipient_city: cityId,
      recipient_zone: 1066,
      // recipient_area: areaId,
      delivery_type: deliveryType,
      item_type: 2,
      item_quantity: order.productInformation.reduce((total, item) => total + (item.sku || 1), 0),
      item_weight: itemWeight,
      amount_to_collect: order.totalAmount || 0, // totalAmount is invalid, cause collected amount = 0
      special_instruction: order.deliveryInfo.noteToSeller || ""
      // item_description: order.productInformation.map(p => p.productTitle).join(', '),
    };

    const response = await fetch("https://api-hermes.pathao.com/aladdin/api/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data?.code === 200 && data?.data?.consignment_id) {
      return Response.json({ trackingCode: data.data.consignment_id });
    } else {
      return Response.json({ error: data?.message || "Failed to place Pathao order." }, { status: 400 });
    }
  } catch (err) {
    console.error("Pathao API Error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
