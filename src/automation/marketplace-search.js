const { chromium } = require('playwright');

const MARKETPLACES = {
  walmart: {
    label: 'Walmart',
    url: query => `https://www.walmart.com/search?q=${encodeURIComponent(query)}`,
    selector: 'div.search-result-gridview-item-wrapper, div.search-result-listview-item-wrapper',
    extract: item => {
      const title = item.querySelector('a.product-title-link span')?.textContent?.trim() || item.querySelector('a.product-title-link')?.textContent?.trim();
      const url = item.querySelector('a.product-title-link')?.href || null;
      const priceWhole = item.querySelector('span.price-characteristic')?.getAttribute('content');
      const priceFraction = item.querySelector('span.price-mantissa')?.getAttribute('content');
      const price = priceWhole ? `${priceWhole}.${priceFraction || '00'}` : null;
      const rating = item.querySelector('span.seo-avg-rating')?.textContent?.trim() || null;
      const reviews = item.querySelector('span.stars-reviews-count-node')?.textContent?.trim() || null;
      return { title, price, rating, reviews, url };
    }
  },
  amazon: {
    label: 'Amazon',
    url: query => `https://www.amazon.com/s?k=${encodeURIComponent(query)}`,
    selector: 'div.s-result-item[data-component-type="s-search-result"]',
    extract: item => {
      const title = item.querySelector('h2 a span')?.textContent?.trim();
      const link = item.querySelector('h2 a')?.href || null;
      const priceWhole = item.querySelector('span.a-price-whole')?.textContent?.replace(/[\D]/g, '');
      const priceFraction = item.querySelector('span.a-price-fraction')?.textContent?.replace(/[\D]/g, '');
      const price = priceWhole ? `${priceWhole}.${priceFraction || '00'}` : null;
      const rating = item.querySelector('span.a-icon-alt')?.textContent?.trim() || null;
      const reviews = item.querySelector('span.a-size-base')?.textContent?.trim() || null;
      return { title, price, rating, reviews, link };
    }
  },
  alibaba: {
    label: 'Alibaba',
    url: query => `https://www.alibaba.com/trade/search?fsb=y&IndexArea=product_en&SearchText=${encodeURIComponent(query)}`,
    selector: 'div.J-offer-wrapper',
    extract: item => {
      const title = item.querySelector('h2 a')?.textContent?.trim() || item.querySelector('h2')?.textContent?.trim();
      const link = item.querySelector('h2 a')?.href || null;
      const price = item.querySelector('div.Price span')?.textContent?.trim() || item.querySelector('.elements-offer-price-normal__price')?.textContent?.trim() || null;
      const supplier = item.querySelector('.elements-title-normal__content')?.textContent?.trim() || null;
      return { title, price, supplier, link };
    }
  }
};

async function searchMarketplace(marketplaceKey, query) {
  const marketplace = MARKETPLACES[marketplaceKey];
  if (!marketplace) {
    throw new Error(`Unknown marketplace: ${marketplaceKey}`);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const url = marketplace.url(query);

  console.log(`Searching ${marketplace.label} for: ${query}`);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

  const results = await page.$$eval(marketplace.selector, (items, marketplaceKey) => {
    function safeText(el, selector) {
      return el.querySelector(selector)?.textContent?.trim() || null;
    }

    return items.slice(0, 8).map(item => {
      const title = safeText(item, 'h2 a span') || safeText(item, 'a.product-title-link span') || safeText(item, 'h2');
      const url = item.querySelector('h2 a')?.href || item.querySelector('a.product-title-link')?.href || null;
      const price = safeText(item, 'span.a-price-whole') ? `${safeText(item, 'span.a-price-whole').replace(/\D/g, '')}.${safeText(item, 'span.a-price-fraction')?.replace(/\D/g, '') || '00'}` : safeText(item, 'div.Price span') || safeText(item, '.elements-offer-price-normal__price');
      const rating = safeText(item, 'span.a-icon-alt') || safeText(item, 'span.seo-avg-rating');
      const reviews = safeText(item, 'span.a-size-base') || safeText(item, 'span.stars-reviews-count-node');
      const supplier = safeText(item, '.elements-title-normal__content');
      return { title, price, rating, reviews, supplier, url };
    }).filter(product => product.title);
  }, marketplaceKey);

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}

const [marketplaceArg, ...queryArgs] = process.argv.slice(2);
const marketplaceKey = (marketplaceArg || 'walmart').toLowerCase();
const query = queryArgs.join(' ') || 'massage chair';

searchMarketplace(marketplaceKey, query).catch(error => {
  console.error(error.message);
  process.exit(1);
});
