import  { Story, FilterOption, SortOption } from '../types';

export function filterStories(stories: Story[], filter: FilterOption): Story[] {
  if (filter === 'all') return stories;
  
  const filterKeywords: Record<FilterOption, RegExp> = {
    all: /.*/,
    tech: /tech|technology|software|hardware|gadget|device|apple|google|microsoft|amazon|meta/i,
    ai: /ai|artificial intelligence|machine learning|ml|deep learning|gpt|neural network|llm|chatgpt|bard|claude/i,
    business: /startup|funding|venture|series [A-Z]|raised|ipo|acquisition|business|company|market|stock|investor/i,
    dev: /programming|code|developer|javascript|python|rust|go|typescript|framework|library|api|web|git|github/i
  };
  
  return stories.filter(story => 
    story.title.match(filterKeywords[filter])
  );
}

export function sortStories(stories: Story[], sortOption: SortOption): Story[] {
  return [...stories].sort((a, b) => {
    switch (sortOption) {
      case 'score':
        return b.score - a.score;
      case 'time':
        return b.time - a.time;
      case 'comments':
        return (b.descendants || 0) - (a.descendants || 0);
      default:
        return b.score - a.score;
    }
  });
}
 