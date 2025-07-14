import { BACKEND_URL } from "@/app/config/config";
import { getPathaoToken } from "./pathaoClient";

export async function lookupCityId(cityName) {
  const token = await getPathaoToken();

  const res = await fetch('https://api-hermes.pathao.com/aladdin/api/v1/city-list', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch cities: ${res.statusText}`);
  }

  const result = await res.json();

  if (result.code !== 200) {
    throw new Error(`Pathao API error: ${result.message}`);
  }

  // Find city matching cityName (case insensitive)
  const city = result.data.data.find(
    (c) => c.city_name.toLowerCase() === cityName.toLowerCase()
  );

  if (!city) {
    throw new Error(`City '${cityName}' not found in Pathao city list.`);
  }

  return city.city_id;
};

export async function lookupZoneId(cityId, zoneGuess) {
  // console.log(cityId, "cityId");
  // console.log(zoneGuess, "zoneGuess");

  const token = await getPathaoToken();

  const res = await fetch(
    `https://api-hermes.pathao.com/aladdin/api/v1/cities/${cityId}/zone-list`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
    }
  );

  const data = await res.json();
  // console.log(data, "zone data from pathao");

  if (!data?.data?.data) {
    throw new Error("Failed to get zones from Pathao");
  }

  const zones = data.data.data;
  const normalizedGuess = zoneGuess.toLowerCase();

  // try different match strategies
  const match =
    zones.find((z) => z.zone_name.toLowerCase() === normalizedGuess) ||
    zones.find((z) => z.zone_name.toLowerCase().startsWith(normalizedGuess)) ||
    zones.find((z) => z.zone_name.toLowerCase().includes(normalizedGuess));

  if (!match) {
    throw new Error(`Zone "${zoneGuess}" not found in city ${cityId}`);
  }

  return match.zone_id;
};

async function fetchProductById(productId) {
  try {
    const res = await fetch(`${BACKEND_URL}/singleProduct/${productId}`);
    if (!res.ok) {
      throw new Error(`Product ${productId} fetch failed`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function calculateWeight(productInformation = []) {
  let totalWeightGrams = 0;

  for (const item of productInformation) {
    const product = await fetchProductById(item?._id); // Fetch from DB or cache
    const weight = product?.weight || 0; // weight in grams
    const quantity = item.sku || 1;

    totalWeightGrams += weight * quantity;
  }

  // Pathao expects weight in kilograms (kg), so convert grams to kg
  const totalWeightKg = totalWeightGrams / 1000;

  // Minimum 0.5kg as per Pathao recommendation (if needed)
  return totalWeightKg < 0.5 ? 0.5 : parseFloat(totalWeightKg.toFixed(2));
}
