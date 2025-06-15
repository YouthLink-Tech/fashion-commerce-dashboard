export const placePathaoOrder = async (order) => {
  try {
    const response = await fetch("/api/pathao-order", {
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
      throw new Error(data?.error || "Failed to place Pathao order.");
    }
  } catch (err) {
    console.error("Client Error placing order:", err);
    throw err;
  }
};