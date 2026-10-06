// cypress/e2e/youtube_gaming.cy.js

describe("YouTube - Gaming > Trending videos", () => {
  // Item video di halaman trending (list atau grid)
  const VIDEO_ITEM =
    "ytd-video-renderer, ytd-rich-item-renderer, ytd-grid-video-renderer";

  const normalize = (s) => (s || "").replace(/\s+/g, " ").trim();

  beforeEach(() => {
    cy.viewport(1920, 1080);
    Cypress.on("uncaught:exception", () => false);
  });

  it("video trending no.3 punya title & channel yang sama di halaman video", () => {
    cy.visit("https://www.youtube.com/", { timeout: 60000 });

    // Tutup dialog consent jika muncul
    cy.get("body").then(($b) => {
      const $consent = $b
        .find('button[aria-label*="Accept"], button[aria-label*="Terima"]')
        .filter(":visible")
        .first();
      if ($consent.length) cy.wrap($consent).click();
    });

    // 1.1 Klik menu Gaming di sidebar
    cy.contains("tp-yt-paper-item yt-formatted-string.title", "Show more")
      .closest("tp-yt-paper-item")
      .scrollIntoView()
      .should("be.visible")
      .click();
    cy.get('a[href="/gaming"], a[title="Gaming"]', { timeout: 20000 })
      .filter(":visible")
      .first()
      .click();
    cy.url({ timeout: 20000 }).should("include", "/gaming");

    // 1.2 Klik 'View all' pada bagian Trending videos
    cy.contains(/Trending videos|Video trending/i, { timeout: 20000 })
      .closest(
        "ytd-rich-section-renderer, ytd-rich-shelf-renderer, ytd-item-section-renderer, ytd-shelf-renderer",
      )
      .within(() => {
        cy.contains(/View all|Lihat semua/i).click({ force: true });
      });

    // Halaman trending terbuka
    cy.get(VIDEO_ITEM, { timeout: 20000 }).should("have.length.greaterThan", 2);

    // 1.3 Ambil video no.3 (index 2)
    cy.get(VIDEO_ITEM)
      .eq(2)
      .scrollIntoView()
      .then(($item) => {
        const title = normalize(
          $item.find("#video-title").first().text() ||
            $item.find("a#video-title-link").first().attr("title"),
        );
        const channel = normalize(
          $item
            .find(
              "ytd-channel-name #text, #channel-name #text, #channel-name a",
            )
            .first()
            .text(),
        );

        expect(title, "title di trending").to.not.be.empty;
        expect(channel, "channel di trending").to.not.be.empty;
        cy.log(`Trending #3 -> ${title} | ${channel}`);

        cy.wrap(title).as("title");
        cy.wrap(channel).as("channel");

        cy.wrap($item)
          .find("a#thumbnail, a#video-title, a#video-title-link")
          .first()
          .click({ force: true });
      });

    // 1.4 Verifikasi di halaman video
    cy.url({ timeout: 20000 }).should("include", "/watch");

    cy.get("@title").then((title) => {
      cy.get(
        "ytd-watch-metadata h1 yt-formatted-string, ytd-watch-metadata h1",
        {
          timeout: 20000,
        },
      )
        .filter(":visible")
        .first()
        .should("be.visible")
        .invoke("text")
        .then((t) => {
          const detailTitle = normalize(t);

          cy.log(`Trending title : ${title}`);
          cy.log(`Detail title   : ${detailTitle}`);

          expect(detailTitle).to.eq(title);
        });
    });

    cy.get("@channel").then((channel) => {
      cy.get(
        "ytd-watch-metadata ytd-channel-name a, #owner ytd-channel-name a",
        { timeout: 20000 },
      )
        .first()
        .invoke("text")
        .then((t) => expect(normalize(t)).to.eq(channel));
    });
  });
});
