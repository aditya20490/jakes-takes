// Topic rules. These are keyword guesses, so edit them freely.
// Livestreams are detected automatically, no keywords needed.
export const topics = ['Livestreams', 'Looksmaxing', 'Fitness', 'Mindset', 'Life Advice', 'General'];
export const defaultTopic = 'General';

// Checked top to bottom. The first topic with a matching word wins.
// Each keyword matches the START of a word ("train" matches "training").
export const topicKeywords = {
  Looksmaxing: ['looksmax', 'jawline', 'mewing', 'skincare', 'hairline', 'aesthetic', 'attractive'],
  Fitness: ['workout', 'gym', 'lift', 'train', 'diet', 'meat', 'fruit', 'muscle', 'bulk', 'physique', 'fitness', 'calorie', 'protein', 'gains'],
  Mindset: ['mindset', 'disciplin', 'goal', 'consisten', 'motivat', 'confiden', 'habit', 'mental'],
  'Life Advice': ['advice', 'relationship', 'money', 'career', 'lesson', 'truth', 'story'],
};

// Force one video into a topic: { 'VIDEO_ID': 'Mindset' }
export const overrides = {};
