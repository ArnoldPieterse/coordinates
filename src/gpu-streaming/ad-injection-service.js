/**
 * Ad Injection Service
 * Intelligently injects ads into LLM prompts and tracks revenue
 */

import { EventEmitter } from 'events';

export class AdInjectionService extends EventEmitter {
  constructor() {
    super();
    this.adInventory = new Map();
    this.userPreferences = new Map();
    this.revenueTracking = {
      daily: new Map(),
      monthly: new Map(),
      total: 0
    };
    
    this.adCategories = {
      technology: ['AI', 'software', 'gaming', 'computers'],
      finance: ['investment', 'money', 'business', 'trading'],
      health: ['fitness', 'nutrition', 'wellness', 'medical'],
      entertainment: ['movies', 'music', 'games', 'streaming'],
      education: ['learning', 'courses', 'books', 'training']
    };
    
    this.initializeAdInventory();
  }

  initializeAdInventory() {
    // Technology Ads
    this.addAd({
      id: 'tech_001',
      category: 'technology',
      content: '🚀 Try our new AI-powered development tools! Boost your productivity with intelligent code completion and automated testing.',
      keywords: ['code', 'programming', 'development', 'software'],
      cpm: 2.50, // Cost per mille (per 1000 impressions)
      ctr: 0.025 // Click-through rate
    });

    this.addAd({
      id: 'tech_002',
      category: 'technology',
      content: '🎮 Experience next-gen gaming with our cloud gaming platform! Play AAA titles on any device with ultra-low latency.',
      keywords: ['gaming', 'games', 'entertainment', 'performance'],
      cpm: 3.00,
      ctr: 0.030
    });

    // Finance Ads
    this.addAd({
      id: 'finance_001',
      category: 'finance',
      content: '💰 Start investing smarter with our AI-driven portfolio management! Get personalized investment strategies and real-time market insights.',
      keywords: ['money', 'investment', 'finance', 'trading'],
      cpm: 4.00,
      ctr: 0.020
    });

    // Health Ads
    this.addAd({
      id: 'health_001',
      category: 'health',
      content: '💪 Transform your fitness journey with our AI personal trainer! Get customized workout plans and nutrition advice.',
      keywords: ['fitness', 'health', 'workout', 'nutrition'],
      cpm: 3.50,
      ctr: 0.025
    });

    // Education Ads
    this.addAd({
      id: 'edu_001',
      category: 'education',
      content: '📚 Master new skills with our AI-powered learning platform! Personalized courses in programming, design, and business.',
      keywords: ['learning', 'education', 'courses', 'skills'],
      cpm: 2.00,
      ctr: 0.035
    });
  }

  addAd(ad) {
    this.adInventory.set(ad.id, {
      ...ad,
      impressions: 0,
      clicks: 0,
      revenue: 0,
      lastShown: null
    });
  }

  async injectAds(prompt, adPreferences, userId) {
    const promptKeywords = this.extractKeywords(prompt);
    const userPrefs = this.getUserPreferences(userId);
    
    // Find relevant ads based on prompt content and user preferences
    const relevantAds = this.findRelevantAds(promptKeywords, userPrefs, adPreferences);
    
    if (relevantAds.length === 0) {
      return prompt; // No ads to inject
    }

    // Select the best ad to inject
    const selectedAd = this.selectBestAd(relevantAds, prompt);
    
    // Inject ad into prompt
    const adInjectedPrompt = this.injectAdIntoPrompt(prompt, selectedAd);
    
    // Track impression
    this.trackImpression(selectedAd.id, userId);
    
    // Emit ad injection event
    this.emit('ad:injected', {
      adId: selectedAd.id,
      userId,
      prompt: prompt.substring(0, 100) + '...',
      category: selectedAd.category
    });
    
    return adInjectedPrompt;
  }

  extractKeywords(text) {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    return [...new Set(words)];
  }

  findRelevantAds(promptKeywords, userPrefs, adPreferences) {
    const relevantAds = [];
    
    for (const [adId, ad] of this.adInventory) {
      let relevanceScore = 0;
      
      // Keyword matching
      const keywordMatches = promptKeywords.filter(keyword => 
        ad.keywords.some(adKeyword => 
          keyword.includes(adKeyword) || adKeyword.includes(keyword)
        )
      ).length;
      
      relevanceScore += keywordMatches * 10;
      
      // Category preference matching
      if (userPrefs.preferredCategories.includes(ad.category)) {
        relevanceScore += 20;
      }
      
      // Ad preference matching
      if (adPreferences && adPreferences.categories && 
          adPreferences.categories.includes(ad.category)) {
        relevanceScore += 15;
      }
      
      // Performance factor (CTR)
      relevanceScore += ad.ctr * 100;
      
      if (relevanceScore > 5) {
        relevantAds.push({ ...ad, relevanceScore });
      }
    }
    
    return relevantAds.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  selectBestAd(relevantAds, prompt) {
    if (relevantAds.length === 0) return null;
    
    // Consider prompt length for ad placement
    const promptLength = prompt.length;
    const maxAds = promptLength > 500 ? 2 : 1;
    
    // Select top ads, but avoid showing the same ad too frequently
    const recentAds = relevantAds.filter(ad => {
      const lastShown = this.adInventory.get(ad.id).lastShown;
      return !lastShown || (Date.now() - lastShown.getTime()) > 300000; // 5 minutes
    });
    
    return recentAds.length > 0 ? recentAds[0] : relevantAds[0];
  }

  injectAdIntoPrompt(prompt, ad) {
    const adContent = `\n\n[Sponsored: ${ad.content}]\n\n`;
    
    // Insert ad at natural break points
    const sentences = prompt.split(/[.!?]+/);
    const midPoint = Math.floor(sentences.length / 2);
    
    if (sentences.length > 2) {
      // Insert in the middle
      sentences.splice(midPoint, 0, adContent);
      return sentences.join('.');
    } else {
      // Insert at the end
      return prompt + adContent;
    }
  }

  trackImpression(adId, userId) {
    const ad = this.adInventory.get(adId);
    if (!ad) return;
    
    ad.impressions++;
    ad.lastShown = new Date();
    
    // Calculate revenue from impression
    const revenue = ad.cpm / 1000; // Convert CPM to per-impression
    ad.revenue += revenue;
    
    // Track daily revenue
    const today = new Date().toDateString();
    const dailyRevenue = this.revenueTracking.daily.get(today) || 0;
    this.revenueTracking.daily.set(today, dailyRevenue + revenue);
    
    this.revenueTracking.total += revenue;
  }

  trackClick(adId, userId) {
    const ad = this.adInventory.get(adId);
    if (!ad) return;
    
    ad.clicks++;
    
    // Calculate click revenue (higher than impression)
    const clickRevenue = ad.cpm * ad.ctr;
    ad.revenue += clickRevenue;
    
    // Track daily revenue
    const today = new Date().toDateString();
    const dailyRevenue = this.revenueTracking.daily.get(today) || 0;
    this.revenueTracking.daily.set(today, dailyRevenue + clickRevenue);
    
    this.revenueTracking.total += clickRevenue;
    
    this.emit('revenue:earned', {
      adId,
      userId,
      revenue: clickRevenue,
      type: 'click'
    });
  }

  async trackRevenue(userId, adRevenue) {
    if (!adRevenue) return;
    
    const today = new Date().toDateString();
    const dailyRevenue = this.revenueTracking.daily.get(today) || 0;
    this.revenueTracking.daily.set(today, dailyRevenue + adRevenue);
    
    this.revenueTracking.total += adRevenue;
    
    this.emit('revenue:earned', {
      userId,
      revenue: adRevenue,
      type: 'inference'
    });
  }

  getUserPreferences(userId) {
    if (!this.userPreferences.has(userId)) {
      this.userPreferences.set(userId, {
        preferredCategories: ['technology', 'entertainment'],
        adFrequency: 'normal',
        lastActivity: new Date()
      });
    }
    
    return this.userPreferences.get(userId);
  }

  updateUserPreferences(userId, preferences) {
    const currentPrefs = this.getUserPreferences(userId);
    this.userPreferences.set(userId, {
      ...currentPrefs,
      ...preferences,
      lastActivity: new Date()
    });
  }

  getTodayRevenue() {
    const today = new Date().toDateString();
    return this.revenueTracking.daily.get(today) || 0;
  }

  async getRevenueAnalytics() {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    return {
      total: this.revenueTracking.total,
      today: this.revenueTracking.daily.get(today) || 0,
      yesterday: this.revenueTracking.daily.get(yesterday) || 0,
      topAds: Array.from(this.adInventory.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map(ad => ({
          id: ad.id,
          category: ad.category,
          revenue: ad.revenue,
          impressions: ad.impressions,
          clicks: ad.clicks,
          ctr: ad.ctr
        })),
      categoryBreakdown: this.getCategoryBreakdown()
    };
  }

  getCategoryBreakdown() {
    const breakdown = {};
    
    for (const ad of this.adInventory.values()) {
      if (!breakdown[ad.category]) {
        breakdown[ad.category] = {
          revenue: 0,
          impressions: 0,
          clicks: 0
        };
      }
      
      breakdown[ad.category].revenue += ad.revenue;
      breakdown[ad.category].impressions += ad.impressions;
      breakdown[ad.category].clicks += ad.clicks;
    }
    
    return breakdown;
  }

  getAdInventory() {
    return Array.from(this.adInventory.values());
  }

  addCustomAd(adData) {
    const adId = `custom_${Date.now()}`;
    this.addAd({
      id: adId,
      ...adData
    });
    return adId;
  }

  removeAd(adId) {
    this.adInventory.delete(adId);
  }
} 