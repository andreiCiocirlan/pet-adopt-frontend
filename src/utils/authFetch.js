export const authFetch = (url, options = {}) => {
  const token = localStorage.getItem("authToken");
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });
};
