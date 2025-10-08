import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
        'accept-language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      // Avoid caching for freshness
      cache: 'no-store',
      redirect: 'follow',
    });

    const contentType = res.headers.get('content-type') || '';

    // If the URL already returns JSON array, pass through
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    // Otherwise, treat as HTML and scrape
    const html = await res.text();
    const $ = cheerio.load(html);

    const items: Array<{ id: string; imageUrl: string; description: string; imageHint?: string }> =
      [];

    const seen = new Set<string>();

    // Heuristics for common e-commerce structures
    // Try specific selectors for known e-commerce platforms first

    // Zalando-specific: Look for product images in common containers
    const zalandoSelectors = [
      'article img',
      '.z-navicat-header_productImageContainer img',
      '[data-testid="product-card"] img',
      '.cat_productTile img',
      '.catalogArticlesList_productBox img',
    ];

    // Try Zalando-specific selectors first
    for (const selector of zalandoSelectors) {
      if (items.length > 0) break;
      $(selector).each((_: number, el: cheerio.Element) => {
        const $el = $(el);
        let src =
          $el.attr('data-src') ||
          $el.attr('data-original') ||
          $el.attr('data-lazy-src') ||
          $el.attr('srcset')?.split(',')[0]?.trim().split(' ')[0] ||
          $el.attr('src') ||
          '';

        if (!src || src.length < 10) return;

        try {
          src = new URL(src, url).toString();
        } catch {
          return;
        }

        if (seen.has(src)) return;
        seen.add(src);

        const alt = ($el.attr('alt') || '').trim();
        const title = $el
          .closest('article, a, div[class*="product"]')
          .find('h2, h3, .title, [class*="title"]')
          .first()
          .text()
          .trim();
        const description = title || alt || 'Item';

        items.push({
          id: String(items.length),
          imageUrl: src,
          description,
          imageHint: alt || undefined,
        });
      });
    }

    // Fallback: Generic product card images
    if (items.length === 0) {
      $('img').each((_: number, el: cheerio.Element) => {
        const $el = $(el);
        // Prefer data-src/srcset/src
        let src =
          $el.attr('data-src') ||
          $el.attr('data-original') ||
          $el.attr('data-lazy') ||
          $el.attr('src') ||
          '';

        if (!src) return;

        // Resolve srcset by picking the largest image if present
        const srcset: string | undefined = $el.attr('srcset');
        if (srcset && !src.startsWith('http')) {
          // Choose the last candidate (usually the largest)
          const candidates = srcset
            .split(',')
            .map((s: string) => s.trim().split(' ')[0])
            .filter(Boolean);
          if (candidates.length) src = candidates[candidates.length - 1];
        }

        // Make absolute URL
        try {
          src = new URL(src, url).toString();
        } catch {
          return;
        }

        // Basic filtering: skip icons/sprites/tiny images
        const alt = ($el.attr('alt') || '').trim();
        const width = parseInt($el.attr('width') || '0', 10);
        const height = parseInt($el.attr('height') || '0', 10);
        if (width && width < 120) return;
        if (height && height < 120) return;

        if (seen.has(src)) return;
        seen.add(src);

        const description = alt || 'Item';
        items.push({
          id: String(items.length),
          imageUrl: src,
          description,
          imageHint: alt || undefined,
        });
      });
    }

    // Deduplicate and limit
    const unique = items.slice(0, 60);

    return NextResponse.json(unique);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Scrape failed' }, { status: 500 });
  }
}
