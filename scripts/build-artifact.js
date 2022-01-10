/* eslint-disable comma-dangle */
/* eslint-disable compat/compat */
const { mkdir } = require('fs').promises;
const { existsSync, readdirSync, lstatSync } = require('fs');
const fs = require('fs-extra');
const parser = require('xml2json');
const glob = require('glob');

async function main() {
  const root = process.cwd();

  if (existsSync(`${root}/_tmp_`)) {
    fs.removeSync(`${root}/_tmp_`);
  }
  await mkdir(`${root}/_tmp_`);
  await fs.copy(`${root}/public/at-de`, `${root}/_tmp_/rcm`);

  await fs.copy(
    `${root}/public/raiffeisen-salzburg-invest`,
    `${root}/_tmp_/salzburg`
  );
  await fs.copy(`${root}/public/bg-bg`, `${root}/_tmp_/international/bg-bg`);

  try {
    await Promise.all([
      fs.copy(`${root}/public/at-en`, `${root}/_tmp_/rcm/at-en`),
      fs.copy(`${root}/public/at-it`, `${root}/_tmp_/rcm/at-it`),
      fs.copy(`${root}/public/ch-de`, `${root}/_tmp_/international/ch-de`),
      fs.copy(`${root}/public/ch-en`, `${root}/_tmp_/international/ch-en`),
      fs.copy(`${root}/public/de-de`, `${root}/_tmp_/international/de-de`),
      fs.copy(`${root}/public/es-en`, `${root}/_tmp_/international/es-en`),
      fs.copy(`${root}/public/fr-fr`, `${root}/_tmp_/international/fr-fr`),
      fs.copy(`${root}/public/hr-en`, `${root}/_tmp_/international/hr-en`),
      fs.copy(`${root}/public/hu-en`, `${root}/_tmp_/international/hu-en`),
      fs.copy(`${root}/public/it-it`, `${root}/_tmp_/international/it-it`),
      fs.copy(`${root}/public/li-de`, `${root}/_tmp_/international/li-de`),
      fs.copy(`${root}/public/lu-en`, `${root}/_tmp_/international/lu-en`),
      fs.copy(`${root}/public/pl-en`, `${root}/_tmp_/international/pl-en`),
      fs.copy(`${root}/public/ro-en`, `${root}/_tmp_/international/ro-en`),
      fs.copy(`${root}/public/si-en`, `${root}/_tmp_/international/si-en`),
      fs.copy(`${root}/public/sk-en`, `${root}/_tmp_/international/sk-en`),
      fs.copy(`${root}/public/page-data`, `${root}/_tmp_/rcm/page-data`),
      fs.copy(`${root}/public/page-data`, `${root}/_tmp_/salzburg/page-data`),
      fs.copy(
        `${root}/public/page-data`,
        `${root}/_tmp_/international/page-data`
      ),
      fs.copy(`${root}/public/sitemap`, `${root}/_tmp_/rcm/sitemap`),
      fs.copy(`${root}/public/sitemap`, `${root}/_tmp_/salzburg/sitemap`),
      fs.copy(`${root}/public/sitemap`, `${root}/_tmp_/international/sitemap`),
    ]);

    const xmlBlueprint = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
    </urlset>
    `;

    const coreXml = '<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>blub</loc></sitemap></sitemapindex>';

    const coreRcmParsed = JSON.parse(parser.toJson(coreXml));
    const coreSalzburgParsed = JSON.parse(parser.toJson(coreXml));
    const coreInternationalParsed = JSON.parse(parser.toJson(coreXml));

    const rcmDomain = 'https://rcm.at/';
    const rcmSalzburg = 'https://salzburg.com/';
    const rcmInternational = 'https://international.com/';

    const rcmData = JSON.parse(
      parser.toJson(xmlBlueprint, { reversible: true })
    );

    const salzburgData = JSON.parse(
      parser.toJson(xmlBlueprint, { reversible: true })
    );

    const internationalData = JSON.parse(
      parser.toJson(xmlBlueprint, { reversible: true })
    );

    rcmData.urlset.url = [];
    salzburgData.urlset.url = [];
    internationalData.urlset.url = [];

    glob.sync(`${root}/_tmp_/rcm/**/*.html`).forEach((file) => {
      const u = file
        .replace(`${root}/_tmp_/rcm/`, '')
        .replace('index.html', '');
      rcmData.urlset.url.push({
        loc: { $t: `${rcmDomain}${u}` },
      });
    });

    glob.sync(`${root}/_tmp_/salzburg/**/*.html`).forEach((file) => {
      const u = file
        .replace(`${root}/_tmp_/rcm/`, '')
        .replace('index.html', '');
      rcmData.urlset.url.push({
        loc: { $t: `${rcmSalzburg}${u}` },
      });
    });

    glob.sync(`${root}/_tmp_/international/**/*.html`).forEach((file) => {
      const u = file
        .replace(`${root}/_tmp_/rcm/`, '')
        .replace('index.html', '');
      rcmData.urlset.url.push({
        loc: { $t: `${rcmInternational}${u}` },
      });
    });

    coreRcmParsed.sitemapindex.sitemap.loc = `${rcmDomain}sitemap/sitemap-0.xml`;
    coreSalzburgParsed.sitemapindex.sitemap.loc = `${rcmSalzburg}sitemap/sitemap-0.xml`;
    coreInternationalParsed.sitemapindex.sitemap.loc = `${rcmInternational}sitemap/sitemap-0.xml`;

    const rcmSitemap = parser.toXml(rcmData);
    const salzburgSitemap = parser.toXml(salzburgData);
    const internationalSitemap = parser.toXml(internationalData);

    const rcmCore = parser.toXml(coreRcmParsed);
    const salzburgCore = parser.toXml(coreSalzburgParsed);
    const internationalCore = parser.toXml(coreInternationalParsed);

    fs.writeFileSync(`${root}/_tmp_/rcm/sitemap/sitemap-0.xml`, rcmSitemap);
    fs.writeFileSync(
      `${root}/_tmp_/salzburg/sitemap/sitemap-0.xml`,
      salzburgSitemap
    );
    fs.writeFileSync(
      `${root}/_tmp_/international/sitemap/sitemap-0.xml`,
      internationalSitemap
    );

    fs.writeFileSync(`${root}/_tmp_/rcm/sitemap/sitemap-index.xml`, rcmCore);
    fs.writeFileSync(
      `${root}/_tmp_/salzburg/sitemap/sitemap-index.xml`,
      salzburgCore
    );
    fs.writeFileSync(
      `${root}/_tmp_/international/sitemap/sitemap-index.xml`,
      internationalCore
    );

    const files = readdirSync(`${root}/public`).filter(
      (f) =>
        // eslint-disable-next-line implicit-arrow-linebreak
        lstatSync(`${root}/public/${f}`).isFile()
      // eslint-disable-next-line function-paren-newline
    );

    files.forEach((f) => {
      fs.copy(`${root}/public/${f}`, `${root}/_tmp_/rcm/${f}`);
      fs.copy(`${root}/public/${f}`, `${root}/_tmp_/salzburg/${f}`);
      fs.copy(`${root}/public/${f}`, `${root}/_tmp_/international/${f}`);
    });
  } catch (e) {
    console.log(`Error: ${e}`);
  }
}
main();
