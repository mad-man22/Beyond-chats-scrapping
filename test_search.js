const googleIt = require('google-it');

async function testSearch() {
    try {
        const results = await googleIt({ query: 'Can Chatbots Boost Small Business Growth?' });
        console.log('Search Results:', JSON.stringify(results, null, 2));
    } catch (error) {
        console.error('Search error:', error.message);
    }
}

testSearch();
