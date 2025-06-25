// Save this as: pages/api/bing-scraper.ts 
import { NextApiRequest, NextApiResponse } from 'next';
import * as cheerio from 'cheerio';
import clientPromise from '../../lib/mongodb'; // Adjust path as needed
import pLimit from 'p-limit';

interface NewsResult {
  query: string;
  title: string;
  url: string;
  content?: string;
  author?: string;
}

interface ApiResponse {
  success: boolean;
  data?: NewsResult[];
  error?: string;
  message?: string;
  mongoResult?: any;
  batchResult?: BatchProcessResult;
}

interface BatchProcessResult {
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  totalArticlesInserted: number;
  queryResults: Array<{
    query: string;
    success: boolean;
    articlesCount: number;
    error?: string;
  }>;
}

interface MongoDocument {
  researcher: string;
  query: string;
  results: NewsResult[];
  createdAt: Date;
  totalResults: number;
}

async function fetchResults(keyword: string): Promise<NewsResult[]> {
  try {
    const keywordArr = keyword.split(" ");
    const queryKeyword = keywordArr.join("+");
    const searchUrl = `https://www.bing.com/news/search?q=${queryKeyword}&qft=interval%3d%227%22&form=PTFTNR`;

    console.log(`Searching URL: ${searchUrl}`);

    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const results: NewsResult[] = [];

    console.log(`HTML length: ${html.length}`);

    // Try multiple selectors that Bing might use
    const selectors = [
      'a.title',
      '.news-card a[href*="http"]',
      '.na_cnt a[href*="http"]',
      'a[data-author]',
      '.newsitem a',
      'h2 a',
      'a[href*="/news/"]',
      '.news-card-body a',
      'article a',
      '.caption a'
    ];

    let foundLinks = false;
    
    for (const selector of selectors) {
      const links = $(selector);
      console.log(`Selector '${selector}' found ${links.length} links`);
      
      if (links.length > 0) {
        foundLinks = true;
        
        links.each((i, element) => {
          const $element = $(element);
          const href = $element.attr('href');
          const titleText = $element.text().trim();
          const dataAuthor = $element.attr('data-author') || 
                           $element.closest('.newsitem').find('[data-author]').attr('data-author') ||
                           '';

          if (!href || !titleText || titleText.length < 10) return;

          // Make sure URL is absolute
          let fullUrl = href;
          if (href.startsWith('/')) {
            fullUrl = `https://www.bing.com${href}`;
          } else if (!href.startsWith('http')) {
            return; // Skip invalid URLs
          }

          // Skip spam content
          const spamPhrases = ["top stock", "stock to watch", "stock to buy"];
          if (spamPhrases.some(phrase => titleText.toLowerCase().includes(phrase))) {
            console.log("Spam detected, skipping");
            return;
          }

          results.push({
            query: keyword,
            title: titleText,
            url: fullUrl,
            content: "",
            author: dataAuthor
          });
        });
        
        break; // Use the first selector that finds results
      }
    }

    if (!foundLinks) {
      console.log('No links found with any selector. Trying fallback...');
      
      // Fallback: try to find any news-related links
      const fallbackSelectors = ['a[href*="news"]', 'a[href*="article"]', 'a[title]'];
      
      for (const selector of fallbackSelectors) {
        const links = $(selector);
        if (links.length > 0) {
          console.log(`Fallback selector '${selector}' found ${links.length} links`);
          
          links.each((i, element) => {
            if (i >= 10) return false; // Limit to 10 results
            
            const $element = $(element);
            const href = $element.attr('href');
            const titleText = $element.text().trim() || $element.attr('title') || '';

            if (!href || !titleText || titleText.length < 10) return;

            let fullUrl = href;
            if (href.startsWith('/')) {
              fullUrl = `https://www.bing.com${href}`;
            } else if (!href.startsWith('http')) {
              return;
            }

            results.push({
              query: keyword,
              title: titleText,
              url: fullUrl,
              content: "",
              author: ""
            });
          });
          
          if (results.length > 0) break;
        }
      }
      
      // If still no results, log HTML for debugging
      if (results.length === 0) {
        console.log('HTML preview (first 2000 chars):');
        console.log(html.substring(0, 2000));
      }
    }

    console.log(`Found ${results.length} results for "${keyword}"`);
    return results;

  } catch (error) {
    console.error(`Error fetching results for keyword '${keyword}':`, error);
    throw error;
  }
}

async function insertToMongoDB(researcher: string, query: string, results: NewsResult[]): Promise<any> {
  try {
    const client = await clientPromise;
    const db = client.db('research_news'); // Change if needed
    const collection = db.collection('news');

    const now = new Date();
    
    // First, remove existing articles for this researcher-query combination to avoid duplicates
    await collection.deleteMany({ researcher, query });
    
    const documents = results.map(result => ({
      query: query,
      title: result.title,
      link: result.url,
      content: result.content || '',
      summary: '', // Default empty summary
      date: now, // You can extract date from the article if needed
      researcher: researcher,
      isRead: false,
      isImportant: false,
      createdAt: now,
      updatedAt: now,
      highlights: []
    }));

    if (documents.length === 0) {
      return {
        insertedCount: 0,
        insertedIds: {},
        acknowledged: true
      };
    }

    const resultInsert = await collection.insertMany(documents);
    console.log(`Inserted ${resultInsert.insertedCount} documents for ${researcher} - ${query}.`);

    return {
      insertedCount: resultInsert.insertedCount,
      insertedIds: resultInsert.insertedIds,
      acknowledged: resultInsert.acknowledged
    };

  } catch (error) {
    console.error('MongoDB insertion error:', error);
    throw error;
  }
}

async function processResearcherQueries(researcher: string): Promise<BatchProcessResult> {
  const client = await clientPromise;
  const db = client.db("research_news");
  const collection = db.collection("researchers_queries_map");

  const researcherDoc = await collection.findOne({ name: researcher });
  const queries: string[] = researcherDoc?.queries || [];
  if (queries.length === 0) {
    console.warn(`No queries found for researcher "${researcher}"`);
  }

  const batchResult: BatchProcessResult = {
    totalQueries: queries.length,
    successfulQueries: 0,
    failedQueries: 0,
    totalArticlesInserted: 0,
    queryResults: []
  };

  const limit = pLimit(5); // Limit to 5 concurrent promises

  const tasks = queries.map(query =>
    limit(async () => {
      try {
        console.log(`Fetching news for query: ${query}`);
        const results = await fetchResults(query);
        const mongoResult = await insertToMongoDB(researcher, query, results);

        batchResult.successfulQueries++;
        batchResult.totalArticlesInserted += mongoResult.insertedCount;
        batchResult.queryResults.push({
          query,
          success: true,
          articlesCount: mongoResult.insertedCount
        });

        console.log(`Successfully processed "${query}"`);
      } catch (error) {
        console.error(`Failed to process "${query}"`, error);
        batchResult.failedQueries++;
        batchResult.queryResults.push({
          query,
          success: false,
          articlesCount: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    })
  );

  await Promise.allSettled(tasks);

  return batchResult;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Set CORS headers if needed
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const { q: query, save, researcher } = req.query;

      // Single query processing (existing functionality)
      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Query parameter "q" is required, or provide "researcher" parameter for batch processing'
        });
      }

      console.log(`Processing GET request for query: ${query}`);
      const results = await fetchResults(query);

      let mongoResult = null;
      
      // Check if save parameter is present to save to MongoDB
      if (save === 'true' || save === '1') {
        try {
          // Use default researcher if not specified
          const researcherName = typeof researcher === 'string' ? researcher : 'Elon Musk';
          mongoResult = await insertToMongoDB(researcherName, query, results);
          console.log('Data successfully saved to MongoDB');
        } catch (mongoError) {
          console.error('Failed to save to MongoDB:', mongoError);
          // Continue with response even if MongoDB save fails
        }
      }

      return res.status(200).json({
        success: true,
        data: results,
        message: `Found ${results.length} results for query: ${query}${mongoResult ? ' (saved to database)' : ''}`,
        mongoResult: mongoResult
      });

    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { query, saveToDb = false, researcher, batchProcess = false } = req.body;

      // Batch processing for researcher
      if (batchProcess && researcher) {
        console.log(`Processing batch POST request for researcher: ${researcher}`);
        
      if (batchProcess && researcher) {
        console.log(`Processing batch POST request for researcher: ${researcher}`);
        const batchResult = await processResearcherQueries(researcher);

        return res.status(200).json({
          success: true,
          message: `Processed ${batchResult.totalQueries} queries for ${researcher}. Successfully inserted ${batchResult.totalArticlesInserted} articles.`,
          batchResult
        });
      }

        const batchResult = await processResearcherQueries(researcher);
        
        return res.status(200).json({
          success: true,
          message: `Processed ${batchResult.totalQueries} queries for ${researcher}. Successfully inserted ${batchResult.totalArticlesInserted} articles.`,
          batchResult
        });
      }

      // Single query processing
      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Query is required and must be a string'
        });
      }

      console.log(`Processing POST request for query: ${query}`);
      const results = await fetchResults(query);

      let mongoResult = null;
      
      // Save to MongoDB if requested
      if (saveToDb) {
        try {
          const researcherName = researcher || 'Elon Musk';
          mongoResult = await insertToMongoDB(researcherName, query, results);
          console.log('Data successfully saved to MongoDB');
        } catch (mongoError) {
          console.error('Failed to save to MongoDB:', mongoError);
          // Continue with response even if MongoDB save fails
        }
      }

      return res.status(200).json({
        success: true,
        data: results,
        message: `Found ${results.length} results for query: ${query}${mongoResult ? ' (saved to database)' : ''}`,
        mongoResult: mongoResult
      });

    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).json({
    success: false,
    error: `Method ${req.method} not allowed`
  });
}