function getApiBaseUrl() {
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "");
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
