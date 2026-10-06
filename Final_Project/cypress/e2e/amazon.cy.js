// cypress/e2e/amazon_chair.cy.js

describe('Amazon - Search chair, sort by highest price', () => {
  beforeEach(() => {
    // 1. Viewport 1920x1080
    cy.viewport(1920, 1080);

    // Hindari test gagal karena error JS dari situs
    Cypress.on('uncaught:exception', () => false);
  });

  // Ambil angka satuan saja dari teks harga, mis. "$1,249.99" -> 1249
  const toWholePrice = (text) => {
    const match = text.replace(/,/g, '').match(/(\d+)(?:\.\d+)?/);
    return match ? parseInt(match[1], 10) : NaN;
  };

  it('item paling kanan di baris pertama (non-iklan) harus sama dengan di halaman detail', () => {
    cy.visit('https://www.amazon.com/');

    // 2. Search 'chair'
    cy.get('#twotabsearchtextbox').type('chair{enter}');
    
    // 3. Urutkan berdasarkan harga termahal (Price: High to Low)
    cy.get('#s-result-sort-select').select('price-desc-rank', { force: true });
    cy.url().should('include', 'price-desc-rank');
    cy.get('[data-component-type="s-search-result"]').should('have.length.greaterThan', 0);

    // 4. Ambil item paling kanan di baris pertama yang bukan iklan
    cy.get('[data-component-type="s-search-result"]')
      .filter((_, el) => {
        // buang item sponsored/iklan
        const isSponsored =
          el.querySelector('.puis-sponsored-label-text') ||
          el.querySelector('[aria-label="Sponsored"]') ||
          /Sponsored/i.test(el.querySelector('.s-label-popover-default')?.innerText || '');
        const hasPrice = el.querySelector('.a-price .a-price-whole');
        return !isSponsored && hasPrice;
      })
      .then(($items) => {
        // Baris pertama = item dengan posisi top paling kecil
        const rects = [...$items].map((el) => ({
          el,
          rect: el.getBoundingClientRect(),
        }));
        const minTop = Math.min(...rects.map((r) => Math.round(r.rect.top)));
        const firstRow = rects.filter((r) => Math.abs(Math.round(r.rect.top) - minTop) < 5);

        // Paling kanan = left terbesar
        const rightmost = firstRow.reduce((a, b) => (b.rect.left > a.rect.left ? b : a)).el;
        const $rightmost = Cypress.$(rightmost);

        const nameOnSearch = $rightmost.find('h2').first().text().trim();
        const priceOnSearch = toWholePrice(
          $rightmost.find('.a-price .a-price-whole').first().text()
        );

        cy.log(`Search page -> ${nameOnSearch} | $${priceOnSearch}`);

        cy.wrap(nameOnSearch).as('nameOnSearch');
        cy.wrap(priceOnSearch).as('priceOnSearch');

        // Buka item (hapus target _blank bila ada, supaya tetap di tab yang sama)
        cy.wrap($rightmost)
          .find('h2')
          .first()
          .invoke('removeAttr', 'target')
          .click({ force: true });
      });

    // 5. Verifikasi nama & harga di halaman detail
    cy.get('#productTitle', { timeout: 15000 }).should('be.visible');

    cy.get('@nameOnSearch').then((nameOnSearch) => {
      cy.get('#productTitle')
        .invoke('text')
        .then((t) => {
          expect(t.trim()).to.eq(nameOnSearch);
        });
    });

    cy.get('@priceOnSearch').then((priceOnSearch) => {
      cy.get('#corePrice_feature_div .a-price .a-offscreen, .a-price .a-offscreen')
        .first()
        .invoke('text')
        .then((t) => {
          expect(toWholePrice(t)).to.eq(priceOnSearch);
        });
    });
  });
});