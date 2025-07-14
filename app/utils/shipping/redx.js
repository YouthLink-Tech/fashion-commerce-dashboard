export const placeRedXOrder = async (order) => {
  try {
    const response = await fetch("/api/redx-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });

    const data = await response.json();
    // console.log(data, "data with tracking code");

    if (response.ok && data.trackingCode) {
      return data.trackingCode;
    } else {
      throw new Error(data?.error || "Failed to place redx order.");
    }
  } catch (err) {
    console.error("Client Error placing order:", err);
    throw err;
  }
};