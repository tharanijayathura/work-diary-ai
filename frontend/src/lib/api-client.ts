function getApiBaseUrl() {
  // Get URL and remove any trailing slashes
  let apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").trim().replace(/\/$/, "");
  
  // Ensure it starts with http/https
  if (!apiUrl.startsWith("http")) {
    apiUrl = `https://${apiUrl}`;
  }

  // Ensure it ends with /api
  return apiUrl.endsWith("/api") ? apiUrl : `${apiUrl}/api`;
}

export function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("workdiary-current-user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.id) {
          headers["x-user-id"] = user.id;
        }
      } catch (e) {
        // ignore
      }
    }
  }
  
  return headers;
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${getApiBaseUrl()}${endpoint}`;
  
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  return response;
}
