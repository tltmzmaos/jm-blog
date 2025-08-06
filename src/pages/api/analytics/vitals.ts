import type { APIRoute } from 'astro';

// Simple in-memory store for demo (use a real database in production)
const vitalsStore: Array<{
  url: string;
  vitals: Record<string, number>;
  timestamp: number;
  userAgent: string;
}> = [];

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Validate the data
    if (!data.url || !data.vitals || !data.timestamp) {
      return new Response(JSON.stringify({ error: 'Invalid data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Store the vitals data
    vitalsStore.push({
      url: data.url,
      vitals: data.vitals,
      timestamp: data.timestamp,
      userAgent: data.userAgent || 'Unknown'
    });
    
    // Keep only last 1000 entries to prevent memory issues
    if (vitalsStore.length > 1000) {
      vitalsStore.splice(0, vitalsStore.length - 1000);
    }
    
    console.log('Web Vitals received:', {
      url: data.url,
      CLS: data.vitals.CLS?.toFixed(3),
      FID: Math.round(data.vitals.FID || 0),
      LCP: Math.round(data.vitals.LCP || 0),
      FCP: Math.round(data.vitals.FCP || 0),
      TTFB: Math.round(data.vitals.TTFB || 0)
    });
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error processing vitals:', error);
    
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const GET: APIRoute = async () => {
  try {
    // Return aggregated vitals data
    const now = Date.now();
    const last24Hours = vitalsStore.filter(entry => 
      now - entry.timestamp < 24 * 60 * 60 * 1000
    );
    
    if (last24Hours.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No data available',
        count: 0 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Calculate averages
    const averages = {
      CLS: 0,
      FID: 0,
      LCP: 0,
      FCP: 0,
      TTFB: 0
    };
    
    last24Hours.forEach(entry => {
      Object.keys(averages).forEach(metric => {
        averages[metric] += entry.vitals[metric] || 0;
      });
    });
    
    Object.keys(averages).forEach(metric => {
      averages[metric] = averages[metric] / last24Hours.length;
    });
    
    // Get performance grades
    const getGrade = (metric: string, value: number) => {
      const thresholds = {
        CLS: { good: 0.1, poor: 0.25 },
        FID: { good: 100, poor: 300 },
        LCP: { good: 2500, poor: 4000 },
        FCP: { good: 1800, poor: 3000 },
        TTFB: { good: 800, poor: 1800 }
      };
      
      const threshold = thresholds[metric];
      if (!threshold) return 'unknown';
      
      if (value <= threshold.good) return 'good';
      if (value <= threshold.poor) return 'needs-improvement';
      return 'poor';
    };
    
    const grades = {};
    Object.entries(averages).forEach(([metric, value]) => {
      grades[metric] = getGrade(metric, value);
    });
    
    return new Response(JSON.stringify({
      count: last24Hours.length,
      period: '24 hours',
      averages: {
        CLS: Number(averages.CLS.toFixed(3)),
        FID: Math.round(averages.FID),
        LCP: Math.round(averages.LCP),
        FCP: Math.round(averages.FCP),
        TTFB: Math.round(averages.TTFB)
      },
      grades,
      timestamp: now
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // 5 minutes cache
      }
    });
    
  } catch (error) {
    console.error('Error getting vitals:', error);
    
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};