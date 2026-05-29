/**
 * São Bento Scraper
 * Abre semiurbano.lovable.app/horarios, seleciona origem/destino
 * e extrai horários, preços e nome da rota.
 *
 * Uso: node scraper.js --origem "Brodowski" --destino "Ribeirão Preto"
 */

const { chromium } = require('playwright');

const URL = 'https://semiurbano.lovable.app/horarios';

async function scrape(origem, destino) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log(`🔍 Abrindo ${URL}...`);
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });

  // ── 1. Selecionar ORIGEM ──────────────────────────────────────────────
  console.log(`📍 Selecionando origem: ${origem}`);
  const origemBtn = page.locator('[aria-label="Selecionar origem"]');
  await origemBtn.waitFor({ state: 'visible', timeout: 10000 });
  await origemBtn.click();

  // O dropdown aparece como listbox — procura o item com o texto da cidade
  const origemItem = page
    .locator('[role="listbox"] [role="option"]')
    .filter({ hasText: new RegExp(`^${origem}$`, 'i') });
  await origemItem.waitFor({ state: 'visible', timeout: 5000 });
  await origemItem.click();

  // ── 2. Selecionar DESTINO ─────────────────────────────────────────────
  console.log(`📍 Selecionando destino: ${destino}`);
  const destinoBtn = page.locator('[aria-label="Selecionar destino"]');
  await destinoBtn.waitFor({ state: 'visible', timeout: 10000 });
  await destinoBtn.click();

  const destinoItem = page
    .locator('[role="listbox"] [role="option"]')
    .filter({ hasText: new RegExp(`^${destino}$`, 'i') });
  await destinoItem.waitFor({ state: 'visible', timeout: 5000 });
  await destinoItem.click();

  // ── 3. Aguardar resultados carregarem ─────────────────────────────────
  console.log('⏳ Aguardando horários...');
  await page.waitForSelector('.lucide-bus', { timeout: 15000 });
  await page.waitForTimeout(1500); // pequena pausa para render completo

  // ── 4. Extrair dados ──────────────────────────────────────────────────
  const result = await page.evaluate(() => {
    // Nome da rota
    const routeNameEl = document.querySelector('.lucide-bus')?.closest('div')?.querySelector('.text-sm.font-semibold');
    const routeName = routeNameEl?.textContent?.trim() || '';

    // Preços
    const priceEls = document.querySelectorAll('.lucide-ticket');
    const prices = {};
    priceEls.forEach(icon => {
      const container = icon.closest('.flex.items-center');
      if (!container) return;
      const label = container.querySelector('.text-muted-foreground')?.textContent?.trim() || '';
      const value = container.querySelector('.font-bold')?.textContent?.trim() || '';
      if (label && value) prices[label] = value;
    });

    // Horários por dia
    const daySections = document.querySelectorAll('.rounded-lg.border.bg-card .p-4');
    const schedules = [];

    daySections.forEach(section => {
      const dayTitle = section.querySelector('h3')?.textContent?.trim();
      if (!dayTitle) return;

      const directionBlocks = section.querySelectorAll('.rounded-lg.border-2');

      directionBlocks.forEach(block => {
        // Texto de origem do bloco (ex: "Saindo de Brodowski")
        const originSpan = block.querySelector('.bg-primary.text-primary-foreground');
        const dirOrigin = originSpan?.textContent?.trim() || '';

        // Destino do bloco
        const destSpan = block.querySelector('.text-base.font-semibold');
        const dirDest = destSpan?.textContent?.replace('→', '').trim() || '';

        // Horários
        const timeButtons = block.querySelectorAll('button[type="button"]');
        const times = [];
        timeButtons.forEach(btn => {
          const time = btn.textContent?.trim().match(/\d{2}:\d{2}/)?.[0];
          const isRodo = btn.classList.contains('bg-primary/10');
          const isPonto = btn.classList.contains('bg-amber-400/90');
          if (time) {
            times.push({
              time,
              tipo: isRodo ? 'rodoviaria' : isPonto ? 'ponto_especial' : 'normal'
            });
          }
        });

        if (times.length > 0) {
          schedules.push({ day: dayTitle, origin: dirOrigin, dest: dirDest, times });
        }
      });
    });

    return { routeName, prices, schedules };
  });

  await browser.close();
  return result;
}

// ── CLI ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(name);
  return idx !== -1 ? args[idx + 1] : null;
};

const origem = getArg('--origem') || 'Brodowski';
const destino = getArg('--destino') || 'Ribeirão Preto';

scrape(origem, destino)
  .then(data => {
    console.log('\n✅ Dados extraídos:\n');
    console.log(JSON.stringify(data, null, 2));
  })
  .catch(err => {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  });

module.exports = { scrape };
