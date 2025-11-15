import { env } from '../config/env';

export interface SpamCheckResult {
  score: number;
  isSpam: boolean;
  reasons: string[];
}

export class SpamService {
  private static readonly SPAM_PATTERNS = [
    /https?:\/\/[^\s]+/gi, // URLs
    /\b(?:buy|sell|cheap|free|money|cash|prize|winner|click here)\b/gi,
    /(.)\1{4,}/gi, // Repeated characters
  ];

  private static readonly BLOCKED_DOMAINS = [
    'spam-site.com',
    'malicious-domain.org',
  ];

  static checkContent(title: string, body: string): SpamCheckResult {
    const content = `${title} ${body}`.toLowerCase();
    const reasons: string[] = [];
    let score = 0;

    // Check length
    if (content.length < 10) {
      score += 0.3;
      reasons.push('Content too short');
    }

    if (content.length > env.POST_MAX_LEN) {
      score += 0.5;
      reasons.push('Content too long');
    }

    // Check for spam patterns
    for (const pattern of this.SPAM_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        const ratio = matches.length / content.split(' ').length;
        score += Math.min(ratio * 0.5, 0.4);
        reasons.push(`Suspicious pattern detected: ${pattern.source}`);
      }
    }

    // Check for blocked domains
    for (const domain of this.BLOCKED_DOMAINS) {
      if (content.includes(domain)) {
        score += 0.8;
        reasons.push(`Blocked domain detected: ${domain}`);
      }
    }

    // Check for repetitive n-grams
    const words = content.split(/\s+/);
    const bigrams = new Map<string, number>();
    
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
    }

    const maxRepeats = Math.max(...bigrams.values());
    if (maxRepeats > 3) {
      score += Math.min((maxRepeats - 3) * 0.1, 0.3);
      reasons.push('Repetitive content detected');
    }

    // Cap the score at 1.0
    score = Math.min(score, 1.0);

    return {
      score,
      isSpam: score >= env.SPAM_THRESHOLD,
      reasons,
    };
  }

  static checkFrequency(userId: string, timeWindow: number = 300000): boolean {
    // This would normally check against a rate limiting store (Redis)
    // For now, we'll use a simple in-memory approach
    const now = Date.now();
    const userActivity = this.userActivityMap.get(userId) || [];
    
    // Clean old entries
    const recentActivity = userActivity.filter(time => now - time < timeWindow);
    
    // Update the map
    this.userActivityMap.set(userId, recentActivity);
    
    // Check if user is posting too frequently (more than 5 posts in 5 minutes)
    return recentActivity.length >= 5;
  }

  private static userActivityMap = new Map<string, number[]>();

  static recordActivity(userId: string): void {
    const now = Date.now();
    const userActivity = this.userActivityMap.get(userId) || [];
    userActivity.push(now);
    this.userActivityMap.set(userId, userActivity);
  }
}
