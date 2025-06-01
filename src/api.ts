import  { Story, Comment, User, StoryType } from './types';

const API_URL = 'https://hacker-news.firebaseio.com/v0';

export async function fetchStoryIds(type: StoryType = 'top'): Promise<number[]> {
  const response = await fetch(`${API_URL}/${type}stories.json`);
  return await response.json();
}

export async function fetchStory(id: number): Promise<Story> {
  const response = await fetch(`${API_URL}/item/${id}.json`);
  return await response.json();
}

export async function fetchComment(id: number): Promise<Comment> {
  const response = await fetch(`${API_URL}/item/${id}.json`);
  return await response.json();
}

export async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`${API_URL}/user/${id}.json`);
  return await response.json();
}

export async function fetchStories(type: StoryType = 'top', limit = 30): Promise<Story[]> {
  const ids = await fetchStoryIds(type);
  const storyPromises = ids.slice(0, limit).map(id => fetchStory(id));
  return await Promise.all(storyPromises);
}

export function getDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (e) {
    return '';
  }
}

export function formatTime(time: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - time;

  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

async function fetchArticleContent(url: string): Promise<string> {
  if (!url) return '';
  
  try {
    // Using a proxy to fetch article content without CORS issues
    const response = await fetch(`https://hooks.jdoodle.net/proxy?url=${encodeURIComponent(url)}`);
    const html = await response.text();
    
    // Simple HTML content extraction - extract text from paragraphs
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract title
    const title = doc.querySelector('title')?.textContent || '';
    
    // Extract meta description
    const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    
    // Extract paragraphs from the article body - focus on main content areas
    const mainContent = doc.querySelector('main') || doc.querySelector('article') || doc.body;
    const paragraphs = Array.from(mainContent.querySelectorAll('p'))
      .filter(p => p.textContent && p.textContent.trim().length > 50) // Filter out short paragraphs
      .map(p => p.textContent?.trim())
      .slice(0, 5) // Take first 5 substantial paragraphs
      .join(' ');
    
    return [title, metaDesc, paragraphs].filter(Boolean).join(' ').slice(0, 3000);
  } catch (error) {
    console.error('Error fetching article content:', error);
    return '';
  }
}

export async function generateStoryDescription(title: string, url?: string): Promise<string> {
  try {
    // First try to fetch article content if URL is available
    const articleContent = url ? await fetchArticleContent(url) : '';
    
    // Use article content if available, otherwise just use the title
    const contentToAnalyze = articleContent || title;
    
    // Using Meta's Llama 3.3 model via proxy
    const external_api_url = "https://api.together.xyz/v1/completions";
    const response = await fetch(`https://hooks.jdoodle.net/proxy?url=${external_api_url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        prompt: `<|begin_of_text|><|system|>
You are an assistant that generates very concise, accurate 1-2 sentence summaries of tech news articles based on article content or titles. Keep responses under 120 characters and focus on factual information.
<|user|>
Generate a very concise, accurate 1-2 sentence summary of this tech article:
"${contentToAnalyze.substring(0, 4000)}"
<|assistant|>`,
        max_tokens: 60,
        temperature: 0.5,
        top_p: 0.9
      })
    });
    
    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].text.trim();
    }
    return generateFallbackDescription(title);
  } catch (error) {
    console.error('Error generating description:', error);
    return generateFallbackDescription(title);
  }
}

function generateFallbackDescription(title: string): string {
  // Enhanced fallback descriptions based on keywords in the title
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
  } else if (title.match(/privacy|GDPR|data protection|surveillance|tracking/i)) {
    return "Discussion of digital privacy concerns, data protection regulations, or surveillance technologies.";
  } else if (title.match(/mobile|iOS|Android|app|smartphone|tablet/i)) {
    return "News related to mobile technologies, applications, or smartphone platforms and developments.";
  } else if (title.match(/cloud|AWS|Azure|GCP|serverless|SaaS|PaaS/i)) {
    return "Information about cloud computing services, infrastructure, or platform developments.";
  } else {
    return "A trending tech discussion covering innovation and industry developments in the technology sector.";
  }
}

export function textToSpeech(text: string): void {
  if ('speechSynthesis' in window) {
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to use a natural-sounding voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || voice.name.includes('Natural') || !voice.name.includes('Microsoft')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    // Adjust speech parameters for better listening experience
    utterance.rate = 1.0;  // Normal speed
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume
    
    window.speechSynthesis.speak(utterance);
  }
}

export function stopSpeech(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function searchStories(stories: Story[], query: string): Story[] {
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase();
  const queryTerms = lowerQuery.split(/\s+/).filter(term => term.length > 1);
  
  if (queryTerms.length === 0) return [];
  
  return stories.filter(story => {
    const title = story.title.toLowerCase();
    return queryTerms.some(term => title.includes(term));
  }).sort((a, b) => {
    // Sort by relevance - count how many query terms match
    const aMatches = queryTerms.filter(term => a.title.toLowerCase().includes(term)).length;
    const bMatches = queryTerms.filter(term => b.title.toLowerCase().includes(term)).length;
    
    if (bMatches !== aMatches) {
      return bMatches - aMatches; // More matches first
    }
    
    // If same number of matches, sort by score
    return b.score - a.score;
  });
}
 