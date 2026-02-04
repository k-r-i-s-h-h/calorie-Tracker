import axios from 'axios';
import { Platform } from 'react-native';

// Use local network IP so phone can connect
// Make sure your phone is on the same WiFi as this computer
const BASE_URL = 'http://192.168.1.87:8000';

const client = axios.create({
    baseURL: BASE_URL,
    timeout: 60000, // 60 seconds for image analysis
});

export const api = {
    /**
     * Search for food nutrition using AI.
     * @param query Text query (e.g. "2 eggs and toast")
     */
    searchFood: async (query: string) => {
        try {
            const response = await client.get('/api/search', { params: { q: query } });
            return response.data;
        } catch (error) {
            console.error("API Search Error:", error);
            throw error;
        }
    },

    analyzeImage: async (base64: string) => {
        try {
            const response = await client.post('/api/analyze-image', { image: base64 });
            return response.data;
        } catch (error) {
            console.error("API Analyze Error:", error);
            throw error;
        }
    },

    // Future endpoints
    logFood: async (data: any) => {
        try {
            const response = await client.post('/api/log', data);
            return response.data;
        } catch (error) {
            console.error("API Log Error:", error);
            throw error;
        }
    },

    getDayView: async (userId: string, date: string) => {
        try {
            const response = await client.get('/api/day', { params: { user_id: userId, date: date } });
            return response.data;
        } catch (error) {
            console.error("API Get Day Error:", error);
            throw error;
        }
    },

    deleteFood: async (entryId: string) => {
        try {
            const response = await client.delete(`/api/log/${entryId}`);
            return response.data;
        } catch (error) {
            console.error("API Delete Error:", error);
            throw error;
        }
    },

    getStreak: async (userId: string) => {
        try {
            const response = await client.get('/api/streak', { params: { user_id: userId } });
            return response.data.streak;
        } catch (error) {
            console.error("API Streak Error:", error);
            return 0;
        }
    }
};
