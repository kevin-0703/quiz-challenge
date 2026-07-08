const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

async function request(path, options = {}) {
  console.log("Request body:", options.body);
  const url = `${API_URL}${path}`;
  let response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (
    response.status === 401 &&
    path !== "/auth/refresh/" &&
    path !== "/auth/login/" &&
    path !== "/auth/register/"
  ) {
    try {
      const refreshResponse = await fetch(`${API_URL}/auth/refresh/`, {
        method: "POST",
        credentials: "include",
      });
      if (refreshResponse.ok) {
        response = await fetch(`${API_URL}${path}`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
          },
          ...options,
        });
      } else {
        await request("/auth/logout/", { method: "POST" });
      }
    } catch (refreshError) {
      console.error("Token refresh failed:", refreshError);
    }
  }

  let data = null;
  const text = await response.text();
  if (text) {
    data = JSON.parse(text);
  }

  if (!response.ok) {
    const message =
      data?.detail || data?.error || data?.message || "Request failed";
    throw new Error(message);
  }

  return data;
}

export const api = {
  register(payload) {
    return request("/auth/register/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  login(payload) {
    return request("/auth/login/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  logout() {
    return request("/auth/logout/", { method: "POST" });
  },
  me() {
    return request("/auth/me/");
  },
  listQuizzes() {
    return request("/quizzes/");
  },
  listMyQuizzes() {
    return request("/quizzes/mine/");
  },
  createQuiz(payload) {
    return request("/quizzes/create/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateQuiz(id, payload) {
    return request(`/quizzes/${id}/update/`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  deleteQuiz(id) {
    return request(`/quizzes/${id}/delete/`, { method: "DELETE" });
  },
  publishQuiz(id, payload) {
    console.log("publish payload:", payload);

    return request(`/quizzes/${id}/publish/`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getQuiz(id) {
    return request(`/quizzes/${id}/`);
  },
  startAttempt(payload) {
    return request("/attempts/start/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  submitAttempt(attemptId, answers) {
    return request(`/attempts/${attemptId}/submit/`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
  },
};
