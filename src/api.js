export async function api(path, { method = 'GET', body, token } = {}) {
  let res, text;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body && JSON.stringify(body),
    });
    text = await res.text();
  } catch (e) {
    throw new Error('Network error: ' + e.message);
  }
  let data = {};
  try { data = JSON.parse(text); } catch {}
  if (!res.ok) {
    throw Object.assign(
      new Error(data.message || `Failed (${res.status}): ${text.slice(0, 150)}`),
      { status: res.status }
    );
  }
  return data;
}
