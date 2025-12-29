import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://beyond-chats-backend.onrender.com';

export const useArticles = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchArticles = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/articles`);
            setArticles(response.data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch articles');
        } finally {
            setLoading(false);
        }
    }, []);

    const triggerScrape = async () => {
        try {
            await axios.post(`${API_BASE_URL}/scrape`);
            await fetchArticles();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    return { articles, loading, error, refresh: fetchArticles, triggerScrape };
};
