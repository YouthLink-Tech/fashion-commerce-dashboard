import { authOptions } from "@/app/utils/Provider/authOptions";
import { getServerSession } from "next-auth";

export async function POST(request) {

  const merchantId = `${process.env.BAHOK_MERCHANT_ID}`;

  const session = await getServerSession(authOptions);

  if (!session || !session.user?.accessToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const order = await request.json();

    const payload = {
      merchant_id: merchantId, // Replace with your actual Bahok merchant ID
      ref_id: order?.orderNumber,
      name: order?.customerInfo?.customerName,
      mobile: order?.customerInfo?.phoneNumber,
      address: `${order?.deliveryInfo?.address1 || ""}, ${order?.deliveryInfo?.address2 || ""}, ${order?.deliveryInfo?.city || ""}, ${order?.deliveryInfo?.postalCode || ""}`,
      district: order?.deliveryInfo?.city, // Bahok expects a district name; adjust if needed
      price: order?.totalAmount || 0,
      instruction: order?.deliveryInfo?.noteToSeller || "Handle with care",
      description: order?.productInformation?.map(p => p.productTitle).join(", ") || "E-commerce order",
      ex: 2, // 1 if exchange, otherwise 2
    };

    const response = await fetch("https://api.bahokcourier.com/api/merchant/parcel/store", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.BAHOK_API_TOKEN}`,
        "accessuserid": process.env.BAHOK_MERCHANT_ID
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.success === true && data.data.parcel_id) {
      return Response.json({ trackingCode: data.data.parcel_id });
    } else {
      return Response.json({ error: data?.message || "Failed to store parcel in Bahok." }, { status: 400 });
    }
  } catch (err) {
    console.error("Bahok API Error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
