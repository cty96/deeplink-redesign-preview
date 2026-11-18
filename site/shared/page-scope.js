/* Only the four approved pages receive redesign styles. Product pages have their own entry HTML. */
(function () {
  var base = new URL('../', document.currentScript.src).pathname;
  var path = window.location.pathname.slice(base.length - 1).replace(/\/+$/, '') || '/';
  var home = path === '/' || path === '/deeplink-redesign-preview/home';
  document.documentElement.dataset.deeplinkPageScope = home ? 'redesign' : 'original';
  if (home) document.write([
  "<link rel=\"stylesheet\" href=\"/deeplink-redesign-preview/products/flat-carousel.css\">",
  "<link rel=\"stylesheet\" href=\"/deeplink-redesign-preview/shared/site-typography.css?v=20261118-inverse-audit\">",
  "<link rel=\"stylesheet\" href=\"/deeplink-redesign-preview/shared/site-surfaces.css?v=20261029\">",
  "<link rel=\"stylesheet\" href=\"/deeplink-redesign-preview/shared/site-heroes.css?v=20261029b\">",
  "<link rel=\"stylesheet\" href=\"/deeplink-redesign-preview/shared/site-hero-motion.css?v=20261029c\">",
  "<link rel=\"stylesheet\" href=\"/deeplink-redesign-preview/shared/hero-reference-restore.css?v=20261029f\">",
  "<link rel=\"stylesheet\" href=\"/deeplink-redesign-preview/shared/review-comments.css?v=20261029a\">",
  "<link rel=\"stylesheet\" href=\"/deeplink-redesign-preview/shared/core-feature-accordion.css?v=3\">",
  "<link rel=\"stylesheet\" href=\"/deeplink-redesign-preview/shared/home-product-stack.css?v=20261106-hover-polish\">",
  "<link rel=\"stylesheet\" href=\"/deeplink-redesign-preview/shared/core-feature-reference.css?v=20261104-figma-5502-r2\">",
  "<link rel=\"stylesheet\" href=\"/deeplink-redesign-preview/shared/home-banner-selected.css?v=20261103-soft-edges2\">",
  "<link rel=\"stylesheet\" href=\"/deeplink-redesign-preview/shared/site-review.css?v=20261109-text-tabs\">",
  "<link rel=\"stylesheet\" href=\"/deeplink-redesign-preview/shared/home-operator-motion.css?v=20261118-art-left\">",
  "<script type=\"module\" src=\"/deeplink-redesign-preview/shared/home-operator-motion.js?v=20261118-design-static\"></script>",
  "<link rel=\"stylesheet\" href=\"/deeplink-redesign-preview/products/ecosystem-v21.css?v=20261117-marquee\">",
  "<link rel=\"stylesheet\" href=\"/deeplink-redesign-preview/shared/home-v2.css?v=20261118-academic-badges\">",
  "<link rel=\"stylesheet\" href=\"/deeplink-redesign-preview/shared/home-design-review.css?v=20261118-architecture-blue\">",
  "<link rel=\"stylesheet\" href=\"/deeplink-redesign-preview/shared/home-text-colors.css?v=20261118-inverse-audit\">",
  "<link rel=\"stylesheet\" href=\"/deeplink-redesign-preview/shared/home-text-sizes.css?v=20261118-academic-layout\">"
].join('\n'));
})();
