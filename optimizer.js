const axios = require('axios');
const cheerio = require('cheerio');
const googleIt = require('google-it');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function fetchArticles() {
    try {
        const response = await axios.get(`${API_BASE_URL}/articles`);
        return response.data;
    } catch (error) {
        console.error('Error fetching articles:', error.message);
        return [];
    }
}

async function searchGoogle(title) {
    if (process.env.MOCK_SEARCH_RESULTS) {
        console.log('Using mock search results from environment.');
        return process.env.MOCK_SEARCH_RESULTS.split(',').map(url => ({ link: url.trim() }));
    }

    console.log(`Searching Google for: "${title}"`);
    try {
        const results = await googleIt({ query: title });
        console.log(`Found ${results.length} total search results.`);
        return results
            .filter(r => !r.link.includes('beyondchats.com'))
            .slice(0, 2);
    } catch (error) {
        console.error('Error searching Google:', error.message);
        return [];
    }
}

async function scrapeContent(url) {
    console.log(`Scraping content from: ${url}`);
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 15000
        });
        const $ = cheerio.load(data);
        const content = $('article, main, .post-content, .entry-content, .content, .entry').text().trim() || $('body').text().trim();
        return content.substring(0, 10000);
    } catch (error) {
        console.error(`Error scraping ${url}:`, error.message);
        return '';
    }
}

async function optimizeArticle(originalArticle, competitorContents, competitorUrls) {
    console.log(`Optimizing article: ${originalArticle.title}`);
    console.log(`Using ${competitorUrls.length} competitor articles for context.`);

    const prompt = `
        I have an original blog article and two top-ranking competitor articles on the same topic.
        
        Original Article Title: ${originalArticle.title}
        Original Article Content: ${originalArticle.excerpt}
        
        Competitor Article 1 Content: ${competitorContents[0] || 'N/A'}
        Competitor Article 2 Content: ${competitorContents[1] || 'N/A'}
        
        Task:
        1. Rewrite the original article to be more comprehensive, well-formatted, and similar in quality to the top-ranking articles.
        2. Keep the core message but improve flow, structure (use headers), and depth.
        3. At the end of the article, add a "References" section citing the following sources:
           - ${competitorUrls[0] || 'N/A'}
           - ${competitorUrls[1] || 'N/A'}
        
        Response Format:
        Return ONLY the finalized article content (including title and references) in Markdown format.
    `;

    // Updated model list based on 2025 available models
    const modelsToTry = ["gemini-3-flash-preview", "gemini-2.5-flash-preview-09-2025", "gemini-2.0-flash", "gemini-1.5-flash"];

    for (const modelName of modelsToTry) {
        try {
            console.log(`Attempting generation with model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            if (text) return text;
        } catch (error) {
            console.warn(`Error with model ${modelName}:`, error.message);
        }
    }

    console.error('All Gemini models failed.');
    return null;
}

async function publishOptimizedArticle(optimizedContent, originalId) {
    console.log(`Publishing optimized article for ID: ${originalId}`);
    try {
        const lines = optimizedContent.split('\n');
        const titleLine = lines.find(l => l.trim().startsWith('#')) || lines.find(l => l.trim().length > 0);
        const title = titleLine ? titleLine.replace(/^#+\s*/, '').trim() : 'Optimized Article';

        const payload = {
            title: title,
            link: `https://beyondchats.com/optimized/${originalId}`,
            date: new Date().toISOString().split('T')[0],
            excerpt: optimizedContent
        };

        const response = await axios.post(`${API_BASE_URL}/articles`, payload);
        console.log('Optimized article published with ID:', response.data.id);
        return response.data;
    } catch (error) {
        console.error('Error publishing optimized article:', error.message);
        return null;
    }
}

async function runOptimizationPipeline() {
    const articles = await fetchArticles();
    if (articles.length === 0) {
        console.log('No articles found to optimize.');
        return;
    }

    const article = articles[0];
    console.log(`--- Processing: ${article.title} ---`);

    const competitors = await searchGoogle(article.title);
    const competitorContents = [];
    const competitorUrls = [];

    for (const comp of competitors) {
        const content = await scrapeContent(comp.link);
        if (content && content.length > 200) {
            competitorContents.push(content);
            competitorUrls.push(comp.link);
        }
    }

    const optimizedContent = await optimizeArticle(article, competitorContents, competitorUrls);
    if (optimizedContent) {
        await publishOptimizedArticle(optimizedContent, article.id);
    }

    console.log('--- Optimization Pipeline Finished ---');
}

if (require.main === module) {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        console.error('Missing GEMINI_API_KEY in .env file.');
        process.exit(1);
    }
    runOptimizationPipeline();
}

module.exports = { runOptimizationPipeline };
