import axios from "axios";

const SESSION_ID_KEY = "movie-knowledge-session-id";

function getSessionId() {
    let sessionId = window.localStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
        sessionId = window.crypto.randomUUID();
        window.localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
}

const api = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:5000",
});

export const chatBoat = {
    async getAnswer(question) {
        const response = await api.post("/api/v1/search", {
            question,
            sessionId: getSessionId(),
        });

        return response.data.data;
    },
};