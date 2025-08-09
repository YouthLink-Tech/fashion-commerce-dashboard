import { authOptions } from "@/app/utils/Provider/authOptions";
import { getServerSession } from "next-auth";

export async function POST(request) {

  const session = await getServerSession(authOptions);

  if (!session || !session.user?.accessToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const order = await request.json();

    const payload = {
      invoice: order?.orderNumber,
      recipient_name: order?.customerInfo?.customerName,
      recipient_phone: order?.customerInfo?.phoneNumber,
      alternative_phone: order?.customerInfo?.phoneNumber2 || "",
      recipient_address: [
        order?.deliveryInfo?.address1 || "",
        order?.deliveryInfo?.address2 || "",
        order?.deliveryInfo?.city || "",
        order?.deliveryInfo?.postalCode || ""
      ].filter(Boolean).join(", "),
      cod_amount: order?.totalAmount || 0,
      note: order?.deliveryInfo?.noteToSeller || "",
      total_lot: order?.productInformation?.reduce(
        (sum, product) => sum + (Number(product.sku) || 0),
        0
      ),
      delivery_type: 0,
    };

    const response = await fetch("https://portal.packzy.com/api/v1/create_order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": process.env.STEADFAST_API_ID, // Safe on server
        "Secret-Key": process.env.STEADFAST_SECRET_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data?.status === 200 && data?.consignment?.tracking_code) {
      return Response.json({ trackingCode: data.consignment.tracking_code });
    } else {
      return Response.json({ error: data?.message || "Failed to place Steadfast order." }, { status: 400 });
    }
  } catch (err) {
    console.error("Steadfast API Error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
