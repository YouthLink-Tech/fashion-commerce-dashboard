// app/api/steadfast-order/route.js

import { getDeliveryAreaId } from "@/app/lib/redx/getDeliveryAreaId";
import { authOptions } from "@/app/utils/Provider/authOptions";
import { getServerSession } from "next-auth";

export async function POST(request) {

  const session = await getServerSession(authOptions);

  if (!session || !session.user?.accessToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const order = await request.json();

    const deliveryAreaId = await getDeliveryAreaId(
      order.deliveryInfo.postalCode,
      order.deliveryInfo.city
    );

    const payload = {
      customer_name: order?.customerInfo?.customerName,
      customer_phone: order?.customerInfo?.phoneNumber,
      delivery_area: order.deliveryInfo.city,
      delivery_area_id: deliveryAreaId, // you may need to map city names to IDs
      customer_address: `${order?.deliveryInfo?.address1 || ""}, ${order?.deliveryInfo?.address2 || ""}, ${order?.deliveryInfo?.city || ""}, ${order?.deliveryInfo?.postalCode || ""}`,
      merchant_invoice_id: order?.orderNumber,
      cash_collection_amount: String(0),
      parcel_weight: String(1), // or calculate if available
      instruction: order?.deliveryInfo?.noteToSeller || "Handle with care",
      value: String(0),
      // is_closed_box: "yes", // or use a boolean logic if needed
      pickup_store_id: String(1018176), // set based on your system/store ID
      // parcel_details_json: order?.productInformation?.map((product) => ({
      //   name: product?.productTitle,
      //   category: product?.vendors?.[0] || "General",
      //   value:
      //     product?.discountInfo?.finalPriceAfterDiscount ||
      //     product?.regularPrice ||
      //     0,
      // })),
    };

    console.log("RedX payload:", payload);

    const response = await fetch("https://openapi.redx.com.bd/v1.0.0-beta/parcel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-ACCESS-TOKEN": `Bearer ${process.env.REDX_TOKEN}`
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log(data, "response from redx");

    if (data?.tracking_id) {
      return Response.json({ trackingCode: data.tracking_id });
    } else {
      return Response.json({ error: data?.message || "Failed to store parcel in RedX." }, { status: 400 });
    }
  } catch (err) {
    console.error("RedX API Error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
