import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

type ScrapedItem = {
  id: string;
  imageUrl: string;
  description: string;
  imageHint?: string;
  price?: string;
  rating?: number;
  badge?: string;
  url?: string;
  seller?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'accept-language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'accept-encoding': 'gzip, deflate, br',
      },
      // Avoid caching for freshness
      cache: 'no-store',
      redirect: 'follow',
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch url: ${res.status}` }, { status: 502 });
    }

    const contentType = res.headers.get('content-type') || '';

    // If the URL already returns JSON array, pass through
    if (contentType.includes('application/json')) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const items: ScrapedItem[] = [];
    const seen = new Set<string>();

    // 1) Try JSON-LD Product objects first
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const raw = $(el).contents().text();
        if (!raw) return;
        const parsed = JSON.parse(raw);
        const nodes = Array.isArray(parsed) ? parsed : [parsed];
        for (const node of nodes) {
          if (!node) continue;
          // handle graph style
          const candidates = node['@graph'] ? node['@graph'] : [node];
          for (const cand of candidates) {
            if (!cand) continue;
            if (
              cand['@type'] === 'Product' ||
              (Array.isArray(cand['@type']) && cand['@type'].includes('Product'))
            ) {
              const image = Array.isArray(cand.image) ? cand.image[0] : cand.image;
              const name = cand.name || cand.headline || '';
              const price = cand.offers?.price
                ? String(cand.offers.price)
                : cand.offers?.priceSpecification?.price;
              const rating = cand.aggregateRating?.ratingValue
                ? Number(cand.aggregateRating.ratingValue)
                : undefined;
              const prodUrl = cand.url || url;
              if (!image) continue;
              const abs = (() => {
                try {
                  return new URL(image, url).toString();
                } catch {
                  return null;
                }
              })();
              if (!abs || seen.has(abs)) continue;
              seen.add(abs);
              items.push({
                id: String(items.length),
                imageUrl: abs,
                description: name || 'Item',
                imageHint: name || undefined,
                price: price ? String(price) : undefined,
                rating,
                url: prodUrl,
              });
            }
          }
        }
      } catch {
        // ignore bad JSON-LD
      }
    });

    // 2) Open Graph / Twitter Card single-product fallback
    if (items.length === 0) {
      const ogImage =
        $('meta[property="og:image"]').attr('content') ||
        $('meta[name="twitter:image"]').attr('content');
      const ogTitle =
        $('meta[property="og:title"]').attr('content') ||
        $('meta[name="twitter:title"]').attr('content') ||
        $('title').text();
      const ogDesc =
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="twitter:description"]').attr('content') ||
        '';
      if (ogImage) {
        try {
          const abs = new URL(ogImage, url).toString();
          items.push({
            id: '0',
            imageUrl: abs,
            description: `${ogTitle}`.trim() || 'Item',
            imageHint: ogDesc || undefined,
            url,
          });
        } catch {
          // ignore
        }
      }
    }

    // 3) Generic product-card heuristics (many e-commerce sites)
    if (items.length === 0) {
      // Common product card selectors (broad)
      const cardSelectors = [
        '[data-testid*="product"], [data-test*="product"]',
        '[class*="product"], [class*="card"], [class*="tile"], [class*="item"]',
        'article',
        '.product-item',
        '.product-card',
        '.grid-item',
      ];

      for (const sel of cardSelectors) {
        $(sel).each((_: number, el: cheerio.Element) => {
          const $el = $(el);
          // find image inside card
          const img = $el.find('img').first();
          if (!img || !img.attr('src')) return;
          let src =
            img.attr('data-src') ||
            img.attr('data-lazy-src') ||
            img.attr('data-original') ||
            img.attr('srcset')?.split(',')?.pop()?.trim().split(' ')[0] ||
            img.attr('src') ||
            '';
          if (!src) return;
          try {
            src = new URL(src, url).toString();
          } catch {
            return;
          }
          if (seen.has(src)) return;
          seen.add(src);

          // get title/alt
          const alt = (img.attr('alt') || '').trim();
          const title =
            $el
              .find('h2, h3, .title, .product-title, [class*="title"], [itemprop="name"]')
              .first()
              .text()
              .trim() ||
            alt ||
            '';

          // price heuristics
          const price =
            $el
              .find(
                '[data-testid*="price"], [class*="price"], .price-current, .price-amount, [itemprop="price"]'
              )
              .first()
              .text()
              .trim() ||
            $el.find('meta[itemprop="price"]').attr('content') ||
            undefined;

          // rating heuristics
          const ratingText = $el
            .find('[data-testid*="rating"], .rating, .stars, [itemprop="ratingValue"]')
            .first()
            .text()
            .trim();
          const ratingMatch = ratingText && ratingText.match(/(\d+(\.\d+)?)/);
          const rating = ratingMatch ? Number(ratingMatch[0]) : undefined;

          // badge (promo/new)
          const badge =
            $el
              .find('.badge, .label, .pill, [class*="badge"], [class*="label"]')
              .first()
              .text()
              .trim() || undefined;

          // seller/brand heuristics
          const seller =
            $el
              .find('[data-testid*="brand"], [class*="brand"], .brand, .seller, [itemprop="brand"]')
              .first()
              .text()
              .trim() || undefined;

          // product link
          const linkEl = $el.find('a').first();
          const prodUrl =
            linkEl && linkEl.attr('href')
              ? (() => {
                  try {
                    return new URL(linkEl.attr('href')!, url).toString();
                  } catch {
                    return url;
                  }
                })()
              : url;

          items.push({
            id: String(items.length),
            imageUrl: src,
            description: title || 'Item',
            imageHint: alt || undefined,
            price: price ? price : undefined,
            rating,
            badge,
            url: prodUrl,
            seller,
          });
        });

        if (items.length > 0) break;
      }
    }

    // 4) Generic fallback: all images on page (filter icons/small images)
    if (items.length === 0) {
      $('img').each((_: number, el: cheerio.Element) => {
        const $el = $(el);
        let src =
          $el.attr('data-src') ||
          $el.attr('data-original') ||
          $el.attr('data-lazy') ||
          $el.attr('srcset')?.split(',')?.pop()?.trim().split(' ')[0] ||
          $el.attr('src') ||
          '';
        if (!src) return;
        try {
          src = new URL(src, url).toString();
        } catch {
          return;
        }
        const alt = ($el.attr('alt') || '').trim();
        const width = parseInt($el.attr('width') || '0', 10);
        const height = parseInt($el.attr('height') || '0', 10);
        if ((width && width < 120) || (height && height < 120)) return;
        if (seen.has(src)) return;
        seen.add(src);
        items.push({
          id: String(items.length),
          imageUrl: src,
          description: alt || 'Item',
          imageHint: alt || undefined,
        });
      });
    }

    // Normalize and cap results
    const normalized = items
      .map((it) => ({
        id: it.id,
        imageUrl: it.imageUrl,
        description: it.description || 'Item',
        imageHint: it.imageHint,
        price: it.price,
        rating: it.rating,
        badge: it.badge,
        url: it.url,
        seller: it.seller,
      }))
      .slice(0, 60);

    return NextResponse.json(normalized);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Scrape failed' }, { status: 500 });
  }
}
