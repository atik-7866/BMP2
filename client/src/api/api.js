import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:5000",
});

export const chatBoat = {
    async getAnswer(question) {
        const response = await api.post("/api/v1/search", {
            question,
        });

        return response.data.data;
    },
};