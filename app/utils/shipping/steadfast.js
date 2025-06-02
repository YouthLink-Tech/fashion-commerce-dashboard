// in your client code, e.g. /utils/steadfast.js or wherever you keep your client helpers

export const placeSteadfastOrder = async (order) => {
  try {
    const response = await fetch("/api/steadfast-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });

    const data = await response.json();

    if (response.ok && data.trackingCode) {
      return data.trackingCode;
    } else {
      throw new Error(data?.error || "Failed to place Steadfast order.");
    }
  } catch (err) {
    console.error("Client Error placing order:", err);
    throw err;
  }
};