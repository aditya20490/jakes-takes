// Whole-word matches only, so innocent words are NOT blocked.
// Add or remove words freely. Lowercase only.
export const blockedWords = [
  'shit', 'shits', 'shitty', 'bitch', 'bitches', 'bastard',
  'asshole', 'assholes', 'dick', 'dickhead', 'cunt', 'pussy',
  'whore', 'slut', 'faggot', 'fag', 'retard', 'retarded',
  'madarchod', 'bhenchod', 'behenchod', 'chutiya', 'bhosdike',
  'gandu', 'randi',
];

// Blocked when a word STARTS with one of these (catches fucking, fucker, etc.).
// Keep this list tiny and only for unmistakable terms.
export const blockedStems = ['fuck', 'nigg', 'motherf'];
