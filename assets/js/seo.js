window.urbeiaSEO = (() => {
  const SITE_URL = 'https://map.urbeia.com.br';
  const SITE_NAME = 'Urbeia Map';
  const DEFAULT_IMAGE = `${SITE_URL}/assets/img/og-cover.png`;

  function absoluteUrl(pathOrUrl) {
    if (!pathOrUrl) return DEFAULT_IMAGE;
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
    const origin = window.location.origin || SITE_URL;
    return `${origin}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
  }

  function hiveUrl(slug) {
    const encoded = encodeURIComponent(slug || '');
    const isLocal = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
    return isLocal ? `/h.html?slug=${encoded}` : `/h/${encoded}/`;
  }

  function upsertMeta(selector, attrs) {
    let el = document.head.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      document.head.appendChild(el);
    }
    Object.entries(attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null) el.setAttribute(key, value);
    });
  }

  function upsertLink(rel, href) {
    let el = document.head.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement('link');
      el.rel = rel;
      document.head.appendChild(el);
    }
    el.href = href;
  }

  function setJSONLD(id, data) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
  }

  function setPageMeta({
    title,
    description,
    path = '/',
    image = DEFAULT_IMAGE,
    type = 'website',
    robots,
  }) {
    const url = absoluteUrl(path);
    const imageUrl = absoluteUrl(image);
    const fullTitle = title?.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`;

    document.title = fullTitle;
    upsertLink('canonical', url);

    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    if (robots) upsertMeta('meta[name="robots"]', { name: 'robots', content: robots });

    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl });
    upsertMeta('meta[property="og:image:width"]', { property: 'og:image:width', content: '1200' });
    upsertMeta('meta[property="og:image:height"]', { property: 'og:image:height', content: '630' });
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: 'pt_BR' });

    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl });

    return { url, imageUrl, fullTitle };
  }

  return {
    SITE_URL,
    SITE_NAME,
    DEFAULT_IMAGE,
    absoluteUrl,
    hiveUrl,
    setPageMeta,
    setJSONLD,
  };
})();
