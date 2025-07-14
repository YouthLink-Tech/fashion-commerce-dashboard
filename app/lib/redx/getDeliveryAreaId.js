// lib/redx/getDeliveryAreaId.js

export async function getDeliveryAreaId(postalCode, cityOrAreaName) {
  const postalCodeNumber = Number(postalCode);

  try {
    const response = await fetch(
      `https://openapi.redx.com.bd/v1.0.0-beta/areas?post_code=${postalCodeNumber}`,
      {
        headers: {
          "API-ACCESS-TOKEN": `Bearer ${process.env.REDX_TOKEN}`,
        },
      }
    );

    const data = await response.json();
    // console.log(data, "data4");


    const matchedArea = data?.areas?.find(
      (area) => area.name.toLowerCase() === cityOrAreaName.toLowerCase()
    );
    // console.log(matchedArea, "matchedArea");


    return matchedArea?.id || 14;
  } catch (err) {
    console.error("Error fetching delivery area ID:", err);
    return null;
  }
}
