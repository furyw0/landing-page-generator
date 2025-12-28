import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { GeneratedContent } from './content-generator.service';

export class HTMLBuilderService {
  async build(
    templateId: string,
    siteName: string,
    content: GeneratedContent,
    mainUrl: string,
    hreflangUrl: string
  ): Promise<string> {
    // Template'i oku
    const templatePath = path.join(process.cwd(), 'templates', `${templateId}.html`);
    let html = await fs.readFile(templatePath, 'utf-8');

    // 0. Brand Name Replacement (Meritking → siteName) - string replacement
    const brandName = siteName.charAt(0).toUpperCase() + siteName.slice(1);
    html = html.replace(/Meritking/g, brandName).replace(/meritking/g, siteName.toLowerCase());
    
    const $ = cheerio.load(html);

    // 1. Meta Tags
    $('title').text(content.meta.metaTitle);
    $('meta[name="description"]').attr('content', content.meta.metaDescription);
    $('meta[name="keywords"]').attr('content', content.meta.metaKeywords);

    // Open Graph
    $('meta[property="og:title"]').attr('content', content.meta.metaTitle);
    $('meta[property="og:description"]').attr('content', content.meta.metaDescription);
    $('meta[property="og:url"]').attr('content', mainUrl);

    // Twitter Card
    $('meta[name="twitter:title"]').attr('content', content.meta.metaTitle);
    $('meta[name="twitter:description"]').attr('content', content.meta.metaDescription);

    // 2. URLs
    // Canonical: Main URL
    $('link[rel="canonical"]').attr('href', mainUrl);

    // Hreflang: Hreflang URL
    $('link[rel="alternate"][hreflang="tr"]').attr('href', hreflangUrl);
    $('link[rel="alternate"][hreflang="x-default"]').attr('href', mainUrl);

    // Tüm placeholder URL'leri değiştir
    this.replaceUrls($, 'a[href]', 'href', mainUrl, hreflangUrl);
    this.replaceUrls($, 'meta[content]', 'content', mainUrl, hreflangUrl);
    this.replaceUrls($, 'img[src]', 'src', mainUrl, hreflangUrl);

    // 3. Hero Section
    const $heroTitle = $('.hero-title').first();
    if ($heroTitle.length) {
      const words = content.hero.heroTitle.split(' ');
      const firstWord = words[0];
      const restWords = words.slice(1).join(' ');
      $heroTitle.html(`<span class="highlight">${firstWord}</span> ${restWords}`);
    }

    const $heroSubtitle = $('.hero-subtitle').first();
    if ($heroSubtitle.length) {
      $heroSubtitle.text(content.hero.heroSubtitle);
    }

    // Hero badges/features (3 adet)
    $('.hero-feature').each((i, el) => {
      if (content.hero.heroBadges[i]) {
        const $el = $(el);
        const $span = $el.find('span');
        if ($span.length) {
          $span.text(content.hero.heroBadges[i]);
        }
      }
    });

    // 4. CTA Buttons
    $('.btn-primary, .btn.btn-primary').first().text(content.buttons.primary);
    $('.btn-secondary, .btn.btn-secondary').first().text(content.buttons.secondary);

    // 5. Security Section
    $('.security-text h3, .security-title').text(content.security.securityTitle);
    $('.security-text p, .security-description').text(content.security.securityDescription);

    // 6. Features (if exists)
    if (content.features) {
      $('.feature-card, .feature, .card').each((i, el) => {
        if (content.features && content.features[i]) {
          const $el = $(el);
          $el.find('h3, .feature-title').text(content.features[i].title);
          $el.find('p, .feature-description').text(content.features[i].description);
        }
      });
    }

    // 7. Article Section (if exists)
    if (content.article) {
      const $articleContent = $('.article-content, article');
      if ($articleContent.length) {
        let articleHTML = `<h2>${content.article.mainTitle}</h2>\n`;

        content.article.sections.forEach((section) => {
          articleHTML += `\n<h3>${section.h3}</h3>\n`;
          section.paragraphs.forEach((p) => {
            articleHTML += `<p>${p}</p>\n`;
          });
        });

        $articleContent.html(articleHTML);
      }
    }

    // 8. FAQs
    $('.faq-item, .faq').each((i, el) => {
      if (content.faqs[i]) {
        const $el = $(el);
        $el.find('.faq-question span, .faq-question').text(content.faqs[i].question);
        $el.find('.faq-answer p, .faq-answer').text(content.faqs[i].answer);
      }
    });

    // 9. Footer
    $('.footer-section').first().find('p').first().text(content.footer.about);
    $('.footer-bottom p').first().text(content.footer.copyright);

    // 10. Structured Data (JSON-LD)
    this.updateStructuredData($, mainUrl, content, brandName);

    return $.html();
  }

  private replaceUrls(
    $: cheerio.CheerioAPI,
    selector: string,
    attr: string,
    mainUrl: string,
    hreflangUrl: string
  ) {
    $(selector).each((i, el) => {
      const $el = $(el);
      let val = $el.attr(attr);
      if (val) {
        // siteurl.com → mainUrl
        val = val.replace(/https?:\/\/siteurl\.com\/?/g, mainUrl + '/');
        val = val.replace(/siteurl\.com/g, new URL(mainUrl).hostname);

        // domain.com → hreflangUrl
        val = val.replace(/https?:\/\/domain\.com\/?/g, hreflangUrl + '/');
        val = val.replace(/domain\.com/g, new URL(hreflangUrl).hostname);

        // Clean double slashes
        val = val.replace(/([^:]\/)\/+/g, '$1');

        $el.attr(attr, val);
      }
    });
  }

  private updateStructuredData($: cheerio.CheerioAPI, mainUrl: string, content: GeneratedContent, brandName: string) {
    $('script[type="application/ld+json"]').each((i, el) => {
      const $el = $(el);
      let jsonLD: any;

      try {
        jsonLD = JSON.parse($el.html() || '{}');
      } catch (e) {
        return;
      }

      // Organization Schema
      if (jsonLD['@type'] === 'Organization') {
        jsonLD.name = brandName + ' Casino';
        jsonLD.url = mainUrl;
        jsonLD.description = content.meta.metaDescription;
      }

      // WebSite Schema
      if (jsonLD['@type'] === 'WebSite') {
        jsonLD.name = brandName;
        jsonLD.url = mainUrl;
        if (jsonLD.potentialAction) {
          jsonLD.potentialAction.target = mainUrl + '/search?q={search_term_string}';
        }
      }

      // FAQPage Schema
      if (jsonLD['@type'] === 'FAQPage') {
        jsonLD.mainEntity = content.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        }));
      }

      $el.html(JSON.stringify(jsonLD, null, 2));
    });
  }
}

