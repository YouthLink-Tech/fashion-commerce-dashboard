let accessToken = null;
let refreshToken = null;
let tokenExpiresAt = null;

export async function getPathaoToken() {
  const now = Math.floor(Date.now() / 1000); // current time in seconds

  if (accessToken && tokenExpiresAt && now < tokenExpiresAt - 60) {
    return accessToken;
  }

  const client_id = process.env.PATHAO_CLIENT_ID;
  const client_secret = process.env.PATHAO_CLIENT_SECRET;

  let payload = {
    client_id,
    client_secret,
    grant_type: "password",
    username: process.env.PATHAO_USERNAME,
    password: process.env.PATHAO_PASSWORD,
  };

  if (refreshToken) {
    payload = {
      client_id,
      client_secret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    };
  }

  const res = await fetch("https://api-hermes.pathao.com/aladdin/api/v1/issue-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || !data?.access_token) {
    console.error("Failed to get Pathao token:", data);
    throw new Error(data?.message || "Token request failed");
  }

  // Save token data
  accessToken = data.access_token;
  refreshToken = data.refresh_token;
  tokenExpiresAt = now + data.expires_in;

  return accessToken;
};