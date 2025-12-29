const axios = require('axios');
const cheerio = require('cheerio');
const db = require('./db');

const BASE_URL = 'https://beyondchats.com/blogs/';

async function getArticlesFromPage(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);
        const articles = [];

        $('article').each((i, el) => {
            const title = $(el).find('.entry-title a, .ct-entry-title a, h2 a').text().trim();
            const link = $(el).find('.entry-title a, .ct-entry-title a, h2 a').attr('href');
            const date = $(el).find('.ct-meta-element-date, .entry-date, time').text().trim();
            const excerpt = $(el).find('.entry-excerpt, .ct-entry-content').text().trim();

            if (title && link) {
                articles.push({ title, link, date, excerpt });
            }
        });

        return articles;
    } catch (error) {
        console.error(`Error fetching ${url}:`, error.message);
        return [];
    }
}

async function scrapeOldestArticles() {
    console.log('Starting scrape of oldest articles...');

    // Based on research:
    // Page 15 has 1 article (the oldest)
    // Page 14 has the next 4 oldest at the bottom

    const articlesPage15 = await getArticlesFromPage(`${BASE_URL}page/15/`);
    const articlesPage14 = await getArticlesFromPage(`${BASE_URL}page/14/`);

    // Combine them. Articles on page are usually newest first.
    // Page 15 (oldest page)
    const oldest = articlesPage15.reverse();
    // Page 14 (next oldest page)
    const nextOldest = articlesPage14.reverse();

    const totalOldest = [...oldest, ...nextOldest].slice(0, 5);

    console.log(`Found ${totalOldest.length} articles to store.`);

    for (const article of totalOldest) {
        db.run(
            `INSERT OR IGNORE INTO articles (title, link, date, excerpt) VALUES (?, ?, ?, ?)`,
            [article.title, article.link, article.date, article.excerpt],
            function (err) {
                if (err) {
                    console.error('Error inserting article:', err.message);
                } else {
                    if (this.changes > 0) {
                        console.log(`Inserted: ${article.title}`);
                    } else {
                        console.log(`Skipped (already exists): ${article.title}`);
                    }
                }
            }
        );
    }
}

if (require.main === module) {
    scrapeOldestArticles().then(() => {
        console.log('Scraping process initiated.');
    });
}

module.exports = { scrapeOldestArticles };
