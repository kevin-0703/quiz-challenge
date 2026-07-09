const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// --- single-flight refresh lock ---
// Ensures that if multiple requests 401 at the same time, only ONE
// call to /auth/refresh/ actually happens. Every other caller just
// awaits the same in-flight promise.
let refreshPromise = null;

function doRefresh() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh/`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => {
        refreshPromise = null;
        return res;
      })
      .catch((err) => {
        refreshPromise = null;
        throw err;
      });
  }
  return refreshPromise;
}

async function request(path, options = {}, _isRetry = false) {
  const url = `${API_URL}${path}`;
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const isAuthEndpoint =
    path === "/auth/refresh/" ||
    path === "/auth/login/" ||
    path === "/auth/register/";

  if (response.status === 401 && !isAuthEndpoint && !_isRetry) {
    let refreshOk = false;
    try {
      const refreshResponse = await doRefresh();
      refreshOk = refreshResponse.ok;
    } catch (refreshError) {
      refreshOk = false;
    }

    if (refreshOk) {
      // Retry the original request exactly once. _isRetry=true stops
      // us from looping forever if it 401s again.
      return request(path, options, true);
    }

    // Refresh genuinely failed (refresh token expired/blacklisted/invalid).
    // Don't call the API again here — just clear client state and let the
    // caller / app-level auth context redirect to login.
    const authError = new Error("Session expired. Please log in again.");
    authError.isAuthError = true;
    throw authError;
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
    return request(`/quizzes/${id}/publish/`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getQuiz(id) {
    return request(`/quizzes/${id}/update/`);
  },
  getQuizForTaking(id) {
    return request(`/quizzes/${id}/takequiz/`);
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
