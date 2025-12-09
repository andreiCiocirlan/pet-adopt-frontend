export const authFetch = async (url, options = {}) => {
  const getCurrentToken = () => localStorage.getItem("accessToken");

  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: getCurrentToken() ? `Bearer ${getCurrentToken()}` : "",
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401 && !options._retry) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const refreshResponse = await fetch("http://localhost:8081/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          localStorage.setItem('accessToken', refreshData.accessToken);

          const newOptions = {
            ...options,
            _retry: true,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${refreshData.accessToken}`,
              "Content-Type": "application/json",
            },
          };

          // Retry with NEW token
          response = await fetch(url, newOptions);
        } else {
          localStorage.clear();
          window.location.href = '/login';
          return new Promise(() => {});
        }
      } catch (error) {
        localStorage.clear();
        window.location.href = '/login';
        return new Promise(() => {});
      }
    }
  }

  return response;
};
