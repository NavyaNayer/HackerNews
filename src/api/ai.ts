import  { Story } from '../types';

/**
 * Fetches content from an article URL using our proxy
 */
async function fetchArticleContent(url: string): Promise<string> {
  if (!url) return '';
  
  try {
    // Using proxy to avoid CORS issues
    const response = await fetch(`https://hooks.jdoodle.net/proxy?url=${encodeURIComponent(url)}`);
    const html = await response.text();
    
    // Extract content from HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Get title
    const title = doc.querySelector('title')?.textContent || '';
    
    // Get meta description
    const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    
    // Get main content from paragraphs
    const mainContent = doc.querySelector('main') || doc.querySelector('article') || doc.body;
    const paragraphs = Array.from(mainContent.querySelectorAll('p'))
      .filter(p => p.textContent && p.textContent.trim().length > 50)
      .map(p => p.textContent?.trim())
      .slice(0, 5)
      .join(' ');
    
    return [title, metaDesc, paragraphs].filter(Boolean).join(' ').slice(0, 3000);
  } catch (error) {
    console.error('Error fetching article content:', error);
    return '';
  }
}

/**
 * Generates a summary using Llama 3 through our proxy
 */
export async function generateSummary(story: Story): Promise<string> {
  // For Ask HN stories, use the text content directly
  if (story.type === 'story' && story.text) {
    const lines = story.text
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
    // Return first two lines truncated to 220 characters
    return lines.slice(0, 2).join(' ').slice(0, 220);
  }

  // For other stories, continue with existing URL content fetching
  const articleContent = story.url ? await fetchArticleContent(story.url) : '';
  const contentToAnalyze = articleContent || story.title;
  // If we have article content, return the first few lines as the description
  if (articleContent) {
    const lines = articleContent
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
    // Truncate to 220 characters for card consistency
    return lines.slice(0, 2).join(' ').slice(0, 220);
  }
  // If no article content, fallback to title or fallback summary
  return generateFallbackSummary(story.title);
}

/**
 * Generates a fallback summary based on keywords in the title
 */
function generateFallbackSummary(title: string): string {
  if (title.match(/AI|artificial intelligence|machine learning|ML|deep learning|GPT|neural network/i)) {
    return "An exploration of artificial intelligence technologies and their potential impacts on industry and society.";
  } else if (title.match(/crypto|blockchain|bitcoin|ethereum|NFT|web3|DeFi|token/i)) {
    return "Analysis of recent developments in cryptocurrency markets and blockchain technology.";
  } else if (title.match(/startup|funding|venture|series [A-Z]|raised|IPO|acquisition/i)) {
    return "Coverage of startup ecosystem news including funding rounds and business developments.";
  } else if (title.match(/security|hack|breach|vulnerability|exploit|cybersecurity|ransomware/i)) {
    return "Details about cybersecurity concerns, recent breaches, or vulnerability discoveries in digital systems.";
  } else if (title.match(/Google|Apple|Microsoft|Amazon|Meta|Facebook|Twitter|X|Tesla|SpaceX/i)) {
    return "News about major tech company strategies, products, or corporate developments in the technology sector.";
  } else if (title.match(/open source|github|git|code|programming|developer|software/i)) {
    return "Updates on open-source software, programming tools, or developer resources in the technology community.";
  } else {
    return "A trending tech discussion covering innovation and industry developments in the technology sector.";
  }
}

// Cache for storing summaries to avoid repeated API calls
const summaryCache = new Map<number, string>();

/**
 * Gets a summary for a story, using cache if available
 */
export async function getStorySummary(story: Story): Promise<string> {
  // Return cached summary if available
  if (summaryCache.has(story.id)) {
    return summaryCache.get(story.id) || '';
  }
  
  try {
    const summary = await generateSummary(story);
    summaryCache.set(story.id, summary);
    return summary;
  } catch (error) {
    console.error(`Error getting summary for story ${story.id}:`, error);
    return "Unable to generate summary at this time.";
  }
}
