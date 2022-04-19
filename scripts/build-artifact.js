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
  rvv_generated: {
    folders: [
      { from: 'at-de', to: '/' },
      'at-de',
      'at-en',
      'at-it',
      'sitemap',
      'page-data',
      '404',
    ],
    domain: 'https://rvv.at/',
  },
  international_generated: {
    folders: [
      'bg-bg',
      'bg-en',
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
      '404',
    ],
    domain: 'https://international.rvv.at/',
  },
  salzburg_generated: {
    folders: [
      { from: 'raiffeisen-salzburg-invest', to: '/' },
      'page-data',
      'sitemap',
      '404',
    ],
    domain: 'https://salzburg.rvv.at/',
  },
};

const indexXML = '<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>blub</loc></sitemap></sitemapindex>';

const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  </urlset>
  `;

const root = process.cwd();

async function main() {
  /**
   * Set up the build directory
   */
  if (existsSync(`${root}/_tmp_`)) {
    fs.removeSync(`${root}/_tmp_`);
  }
  await mkdir(`${root}/_tmp_`);
  const gatsbyFiles = fs
    .readdirSync(`${root}/public/`, { withFileTypes: true })
    .filter((file) => file.isFile());

  // eslint-disable-next-line guard-for-in
  for (const key in countryFolders) {
    await mkdir(`${root}/_tmp_/${key}`);

    const collectedTasks = [];
    gatsbyFiles.forEach(async (file) => {
      collectedTasks.push(
        fs.copy(
          `${root}/public/${file.name}`,
          `${root}/_tmp_/${key}/${file.name}`
        )
      );
    });

    countryFolders[key].folders.forEach(async (folder) => {
      if (
        typeof folder === 'object'
        && fs.existsSync(`${root}/public/${folder.from}`)
      ) {
        collectedTasks.push(
          fs.copy(
            `${root}/public/${folder.from}`,
            `${root}/_tmp_/${key}/${folder.to}`
          )
        );
      } else if (fs.existsSync(`${root}/public/${folder}`)) {
        collectedTasks.push(
          fs.copy(`${root}/public/${folder}`, `${root}/_tmp_/${key}/${folder}`)
        );
      } else {
        // eslint-disable-next-line no-console
        console.log(`${folder} does not exist`);
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
  await fs.copy(`${root}/public/[...]`, `${root}/_tmp_/rvv_generated/[...]`);
  await fs.copy(
    `${root}/public/[...]`,
    `${root}/_tmp_/international_generated/[...]`
  );
  await fs.copy(
    `${root}/public/[...]`,
    `${root}/_tmp_/salzburg_generated/[...]`
  );
  await fs.copy(`${root}/_tmp_`, `${root}/public/`);
}

main();
