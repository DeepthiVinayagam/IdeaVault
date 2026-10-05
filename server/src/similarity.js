/**
 * IdeaVault Similarity Engine
 * 
 * Implements text preprocessing, TF-IDF (Term Frequency - Inverse Document Frequency),
 * and Cosine Similarity from scratch (no external ML libraries).
 */

// Common English stop words to filter out noise
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'arent', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but',
  'by', 'can', 'cannot', 'cant', 'could', 'couldn', 'couldnt', 'did', 'didn', 'didnt', 'do', 'does',
  'doesn', 'doesnt', 'doing', 'don', 'dont', 'down', 'during', 'each', 'few', 'for', 'from', 'further',
  'had', 'hadn', 'hadnt', 'has', 'hasn', 'hasnt', 'have', 'haven', 'havent', 'having', 'he', 'hed',
  'hell', 'hes', 'her', 'here', 'heres', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'hows',
  'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is', 'isn', 'isnt', 'it', 'its', 'itself',
  'just', 'll', 'm', 'ma', 'me', 'mightn', 'mightnt', 'more', 'most', 'mustn', 'mustnt', 'my',
  'myself', 'needn', 'neednt', 'no', 'nor', 'not', 'now', 'o', 'of', 'off', 'on', 'once', 'only',
  'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 're', 's', 'same', 'shan', 'shant',
  'she', 'shed', 'shell', 'shes', 'should', 'shouldn', 'shouldnt', 'so', 'some', 'such', 't', 'than',
  'that', 'thatll', 'thats', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'theres',
  'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 've', 'very', 'was', 'wasn', 'wasnt', 'we', 'wed', 'well', 'were', 'weren',
  'werent', 'weve', 'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while', 'who',
  'whos', 'whom', 'why', 'whys', 'with', 'won', 'wont', 'would', 'wouldn', 'wouldnt', 'y', 'you',
  'youd', 'youll', 'youre', 'youve', 'your', 'yours', 'yourself', 'yourselves',
  // Domain generic terms that add low discriminative value
  'project', 'system', 'application', 'app', 'using', 'used', 'use', 'based', 'via', 'aims', 'proposes'
]);

/**
 * Clean and tokenize raw text into meaningful words.
 * 1. Convert to lowercase
 * 2. Strip punctuation & special symbols
 * 3. Split by whitespace
 * 4. Remove stop words and single-character tokens
 */
function cleanAndTokenize(text) {
  if (!text || typeof text !== 'string') return [];

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-_]/g, ' ')  // Replace non-alphanumeric chars with space
    .replace(/[_-]/g, ' ')           // Split kebab-case and snake_case
    .split(/\s+/)
    .map(word => word.trim())
    .filter(word => word.length >= 2 && !STOP_WORDS.has(word));
}

/**
 * Calculate Term Frequency (TF) for a single document's tokens.
 * TF = (count of word in document) / (total words in document)
 */
function calculateTF(tokens) {
  const tf = {};
  if (tokens.length === 0) return tf;

  // Count raw frequencies
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }

  // Normalize by total tokens
  for (const token in tf) {
    tf[token] = tf[token] / tokens.length;
  }

  return tf;
}

/**
 * Calculate Inverse Document Frequency (IDF) for each word in the corpus.
 * Smooth IDF formula: log((1 + N) / (1 + doc_count_containing_word)) + 1
 */
function calculateIDF(allDocTokens) {
  const N = allDocTokens.length;
  const docFrequency = {};

  for (const tokens of allDocTokens) {
    const uniqueTokens = new Set(tokens);
    for (const token of uniqueTokens) {
      docFrequency[token] = (docFrequency[token] || 0) + 1;
    }
  }

  const idf = {};
  for (const token in docFrequency) {
    idf[token] = Math.log((1 + N) / (1 + docFrequency[token])) + 1;
  }

  return idf;
}

/**
 * Create a TF-IDF vector mapping each word to its TF * IDF weight
 */
function createTfidfVector(tokens, idf) {
  const tf = calculateTF(tokens);
  const vector = {};

  for (const token in tf) {
    const tokenIDF = idf[token] || (Math.log(2) + 1); // fallback if token was only in query
    vector[token] = tf[token] * tokenIDF;
  }

  return vector;
}

/**
 * Calculate Cosine Similarity between two sparse TF-IDF vectors:
 * Cosine = dot_product(v1, v2) / (magnitude(v1) * magnitude(v2))
 */
function calculateCosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const key in vecA) {
    normA += vecA[key] * vecA[key];
    if (vecB[key]) {
      dotProduct += vecA[key] * vecB[key];
    }
  }

  for (const key in vecB) {
    normB += vecB[key] * vecB[key];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;

  const similarity = dotProduct / (normA * normB);
  // Clamp between 0 and 1 due to floating point inaccuracies
  return Math.max(0, Math.min(1, similarity));
}

/**
 * Extract shared keywords with their combined relevance
 */
function extractSharedKeywords(vecA, vecB, topK = 6) {
  const shared = [];

  for (const term in vecA) {
    if (vecB[term]) {
      // Combined importance is product of their TF-IDF weights
      shared.push({
        term,
        weight: vecA[term] * vecB[term]
      });
    }
  }

  shared.sort((a, b) => b.weight - a.weight);
  return shared.slice(0, topK).map(item => item.term);
}

/**
 * Generate a short, human-readable match explanation
 */
function generateMatchExplanation(similarityScore, sharedKeywords, projectTitle) {
  const percentage = Math.round(similarityScore * 100);
  const kwString = sharedKeywords.length > 0 
    ? `focused on [${sharedKeywords.slice(0, 4).join(', ')}]` 
    : 'in general thematic scope';

  if (percentage >= 70) {
    return `High overlap (${percentage}%) with "${projectTitle}" ${kwString}. Both explore nearly identical core technical objectives and architecture.`;
  } else if (percentage >= 45) {
    return `Moderate overlap (${percentage}%) with "${projectTitle}" ${kwString}. Shares similar technology stack or problem framing.`;
  } else if (percentage >= 20) {
    return `Slight overlap (${percentage}%) with "${projectTitle}" ${kwString}. Some shared concepts or tooling.`;
  } else {
    return `Minimal alignment (${percentage}%) with "${projectTitle}". Minor coincidental terminology.`;
  }
}

/**
 * Generate actionable improvement suggestions for the student's idea
 */
function generateSuggestions(idea, maxSimilarity, topMatches) {
  const suggestions = [];

  // Suggestion 1: Uniqueness / Differentiation
  if (maxSimilarity >= 0.50) {
    suggestions.push({
      category: 'Differentiation',
      title: 'Differentiate your primary value proposition',
      text: `Your idea has strong similarity (${Math.round(maxSimilarity * 100)}%) with prior work like "${topMatches[0]?.title || 'existing projects'}". Emphasize a unique angle such as a distinct user demographic, novel algorithm variant, or specialized offline capabilities.`
    });
  } else if (maxSimilarity >= 0.25) {
    suggestions.push({
      category: 'Scope Refinement',
      title: 'Clarify target use-case boundaries',
      text: 'To make your project stand out from related departmental work, narrow your scope to a well-defined domain pilot rather than an overly broad general solution.'
    });
  } else {
    suggestions.push({
      category: 'Novelty & Validation',
      title: 'Strong domain novelty - Validate feasibility',
      text: 'Your idea appears unique relative to existing records. Conduct user interviews and create a quick prototype to validate technical feasibility early.'
    });
  }

  // Suggestion 2: Technical Depth & Tech Stack
  const techTokens = cleanAndTokenize(idea.technologies || '');
  if (techTokens.length < 3) {
    suggestions.push({
      category: 'Technical Specifics',
      title: 'Specify exact libraries and infrastructure',
      text: 'List concrete frameworks, database choices, APIs, or hardware protocols in your technology stack (e.g., PostgreSQL, WebSockets, Docker, PyTorch) to demonstrate engineering rigor.'
    });
  } else {
    suggestions.push({
      category: 'Architecture',
      title: 'Define data flow & API contracts',
      text: `Good technology stack selected (${idea.technologies}). Create a modular system architecture diagram showing how data moves between your frontend, backend services, and storage.`
    });
  }

  // Suggestion 3: Measurable Outcomes & Evaluation
  const problemLength = (idea.problem_statement || '').length;
  if (problemLength < 100) {
    suggestions.push({
      category: 'Problem Definition',
      title: 'Quantify problem impact and pain points',
      text: 'Elaborate on who suffers from this problem and the tangible cost or friction it creates. Use specific metrics (e.g., "reduces processing time by 40%").'
    });
  } else {
    suggestions.push({
      category: 'Evaluation Criteria',
      title: 'Establish quantitative evaluation benchmarks',
      text: 'Define clear baseline benchmarks to measure project success upon completion (e.g., latency < 200ms, 90%+ test accuracy, or user task completion rate).'
    });
  }

  return suggestions.slice(0, 3);
}

/**
 * Main Comparison Function:
 * Compares an idea against all approved projects in the database.
 * 
 * @param {Object} idea - { title, problem_statement, description, technologies }
 * @param {Array<Object>} approvedProjects - Array of approved project records
 * @returns {Object} Analysis result
 */
function analyzeIdeaSimilarity(idea, approvedProjects) {
  // Combine all idea fields into a single rich text document
  const ideaFullText = `${idea.title || ''} ${idea.title || ''} ${idea.problem_statement || ''} ${idea.description || ''} ${idea.technologies || ''}`;
  const ideaTokens = cleanAndTokenize(ideaFullText);

  // If repository has no approved projects
  if (!approvedProjects || approvedProjects.length === 0) {
    return {
      overall_score: 0,
      overall_percentage: 0,
      has_matches: false,
      top_matches: [],
      shared_keywords: [],
      suggestions: generateSuggestions(idea, 0, []),
      explanation: 'The repository currently has no approved project records to compare against.',
      disclaimer: 'Notice: Similarity analysis highlights keyword and topical overlap against approved historical projects. It is an advisory tool for literature review and uniqueness refinement, not proof of plagiarism or guaranteed novelty.'
    };
  }

  // If idea is completely empty or contains only stop words
  if (ideaTokens.length === 0) {
    return {
      overall_score: 0,
      overall_percentage: 0,
      has_matches: false,
      top_matches: [],
      shared_keywords: [],
      suggestions: [
        {
          category: 'Input Needed',
          title: 'Provide more descriptive details',
          text: 'Please write a comprehensive problem statement and description to enable semantic comparison.'
        }
      ],
      explanation: 'Insufficient input provided to perform semantic comparison.',
      disclaimer: 'Notice: Similarity analysis highlights keyword and topical overlap against approved historical projects. It is an advisory tool for literature review and uniqueness refinement, not proof of plagiarism or guaranteed novelty.'
    };
  }

  // Prepare tokenized documents for the entire corpus (Idea + all Approved Projects)
  const projectDocTokens = approvedProjects.map(p => {
    const projectText = `${p.title || ''} ${p.title || ''} ${p.abstract || ''} ${p.technologies || ''} ${p.department || ''}`;
    return cleanAndTokenize(projectText);
  });

  const allCorpusTokens = [ideaTokens, ...projectDocTokens];
  const corpusIDF = calculateIDF(allCorpusTokens);

  // Compute TF-IDF vector for the student idea
  const ideaVector = createTfidfVector(ideaTokens, corpusIDF);

  // Compute similarities with all approved projects
  const scoredProjects = approvedProjects.map((project, index) => {
    const projTokens = projectDocTokens[index];
    const projVector = createTfidfVector(projTokens, corpusIDF);
    const score = calculateCosineSimilarity(ideaVector, projVector);
    const sharedTerms = extractSharedKeywords(ideaVector, projVector, 6);

    return {
      id: project.id,
      title: project.title,
      abstract: project.abstract,
      technologies: project.technologies,
      department: project.department,
      year: project.year,
      student_names: project.student_names,
      similarity_score: Number(score.toFixed(4)),
      similarity_percentage: Math.round(score * 100),
      shared_keywords: sharedTerms,
      match_explanation: generateMatchExplanation(score, sharedTerms, project.title)
    };
  });

  // Sort descending by similarity score
  scoredProjects.sort((a, b) => b.similarity_score - a.similarity_score);

  // Top 3 matches
  const topMatches = scoredProjects.slice(0, 3);
  const highestMatch = topMatches[0] || null;
  const maxScore = highestMatch ? highestMatch.similarity_score : 0;
  const maxPercentage = Math.round(maxScore * 100);

  // Collect all unique shared keywords from top matches
  const allSharedKeywordsSet = new Set();
  topMatches.forEach(m => {
    m.shared_keywords.forEach(kw => allSharedKeywordsSet.add(kw));
  });
  const sharedKeywordsList = Array.from(allSharedKeywordsSet);

  // Threshold: if highest match is below 12%, consider repository to have no significant match
  const hasSignificantMatches = maxScore >= 0.12;

  let overallExplanation = '';
  if (!hasSignificantMatches) {
    overallExplanation = 'The repository has no closely matching records for this idea. It appears largely distinct from previously completed projects.';
  } else if (maxPercentage >= 65) {
    overallExplanation = `High conceptual overlap detected with ${topMatches.filter(m => m.similarity_percentage >= 50).length} prior project(s). Review recommendations below to refine differentiation.`;
  } else if (maxPercentage >= 35) {
    overallExplanation = `Moderate similarity with existing projects. Certain core modules or technologies share common patterns.`;
  } else {
    overallExplanation = `Low to moderate overlap found. Good overall uniqueness with some shared domain concepts.`;
  }

  const suggestions = generateSuggestions(idea, maxScore, topMatches);

  return {
    overall_score: Number(maxScore.toFixed(4)),
    overall_percentage: maxPercentage,
    has_matches: hasSignificantMatches,
    top_matches: topMatches,
    shared_keywords: sharedKeywordsList,
    suggestions: suggestions,
    explanation: overallExplanation,
    disclaimer: 'Notice: Similarity analysis highlights keyword and topical overlap against approved historical projects. It is an advisory tool for literature review and uniqueness refinement, not proof of plagiarism or guaranteed novelty.'
  };
}

module.exports = {
  cleanAndTokenize,
  calculateTF,
  calculateIDF,
  createTfidfVector,
  calculateCosineSimilarity,
  extractSharedKeywords,
  generateMatchExplanation,
  generateSuggestions,
  analyzeIdeaSimilarity
};
