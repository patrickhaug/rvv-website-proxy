/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable comma-dangle */
/* eslint-disable compat/compat */
const { mkdir } = require('fs').promises;
const { existsSync } = require('fs');
const fs = require('fs-extra');
const parser = require('xml2json');
const glob = require('glob');

const countryFolders = {
  rcm: {
    folders: [
      { from: 'at-de', to: '/' },
      'at-en',
      'at-it',
      'sitemap',
      'page-data',
    ],
    domain: 'https://rcm.at/',
  },
  international: {
    folders: [
      'bg-bg',
      'ch-de',
      'ch-en',
      'de-de',
      'es-en',
      'fr-fr',
      'hr-en',
      'hu-en',
      'it-it',
      'li-de',
      'lu-en',
      'pl-en',
      'ro-en',
      'si-en',
      'sk-en',
      'page-data',
      'sitemap',
    ],
    domain: 'https://international.rcm.at/',
  },
  salzburg: {
    folder: [
      { from: 'raiffeisen-salzburg-invest', to: '/' },
      'page-data',
      'sitemap',
    ],
    domain: 'https://salzburg.rcm.at/',
  },
};

const indexXML = '<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>blub</loc></sitemap></sitemapindex>';

const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  </urlset>
  `;

async function main() {
  const root = process.cwd();

  /**
   * Set up the build directory
   */
  if (existsSync(`${root}/_tmp_`)) {
    fs.removeSync(`${root}/_tmp_`);
  }
  await mkdir(`${root}/_tmp_`);

  // eslint-disable-next-line guard-for-in
  for (const key in countryFolders) {
    await mkdir(`${root}/_tmp_/${key}`);

    const collectedTasks = [];
    countryFolders[key].folders.forEach(async (folder) => {
      if (typeof folder === 'object') {
        collectedTasks.push(
          fs.copy(
            `${root}/public/${folder.from}`,
            `${root}/_tmp_/${key}/${folder.to}`
          )
        );
      } else {
        collectedTasks.push(
          fs.copy(`${root}/public/${folder}`, `${root}/_tmp_/${key}/${folder}`)
        );
      }
    });

    await Promise.all(collectedTasks);

    const parsedIndex = JSON.parse(
      parser.toJson(indexXML, { reversible: true })
    );

    parsedIndex.sitemapindex.sitemap.loc = `${countryFolders[key].domain}sitemap/sitemap-0.xml`;
    await fs.writeFile(
      `${root}/_tmp_/${key}/sitemap/sitemap-index.xml`,
      parser.toXml(parsedIndex)
    );

    const parsedSitemap = JSON.parse(
      parser.toJson(sitemapXML, { reversible: true })
    );

    parsedSitemap.urlset.url = [];

    glob.sync(`${root}/_tmp_/${key}/**/*.html`).forEach((file) => {
      const u = file
        .replace(`${root}/_tmp_/${key}/`, '')
        .replace('index.html', '');
      parsedSitemap.urlset.url.push({
        loc: { $t: `${countryFolders[key].domain}${u}` },
      });
    });

    await fs.writeFile(
      `${root}/_tmp_/${key}/sitemap/sitemap-0.xml`,
      parser.toXml(parsedSitemap)
    );
  }
}
main();
