describe("Agoda - Flight Booking", () => {
  const CARD = '[data-testid="web-refresh-flights-card"]';

  const passenger = {
    firstName: "Shania",
    lastName: "Oktaviani",
    email: "shania@example.com",
    phone: "81234567890",
    nationality: "Indonesia",
    gender: "Female",
    birthDay: "15",
    birthMonth: "January",
    birthYear: "1995",
    passport: "X12345678",
    passportCountry: "Indonesia",
    passportExpiryDay: "31",
    passportExpiryMonth: "December",
    passportExpiryYear: "2032",
  };

  // ---------- helpers ----------
  const normalize = (s) =>
    (s || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  // semua jam "HH:MM" dalam teks, berurutan
  const timesIn = (txt) => {
    const out = [];
    const re = /\b(\d{1,2})[:.](\d{2})\s*([AaPp]\.?[Mm]\.?)?(?!\d)/g;
    const s = normalize(txt);
    let m;
    while ((m = re.exec(s))) {
      let h = Number(m[1]);
      const mi = Number(m[2]);
      if (h > 23 || mi > 59) continue;
      if (m[3]) {
        const pm = /p/i.test(m[3]);
        if (pm && h < 12) h += 12;
        if (!pm && h === 12) h = 0;
      }
      out.push(`${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}`);
    }
    return out;
  };

  // harga pertama dengan pemisah ribuan, jadi digit saja: "IDR 2,345,678.00" -> "2345678"
  const priceIn = (txt) => {
    const m = normalize(txt).match(/\d{1,3}(?:[.,]\d{3})+/);
    return m ? m[0].replace(/\D/g, "") : null;
  };

  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };

  // cari label "Total price", naik ke parent sampai ketemu angka harga
  const readTotalPrice = () =>
    cy
      .contains(/total price|total payment|you pay|^total$/i, {
        timeout: 20000,
      })
      .then(($el) => {
        let $n = $el;
        for (let i = 0; i < 6; i++) {
          const p = priceIn($n.text());
          if (p) return p;
          $n = $n.parent();
        }
        throw new Error(
          "Total price tidak ditemukan. Sesuaikan readTotalPrice() dengan HTML halaman.",
        );
      });

  beforeEach(() => {
    cy.viewport(1920, 1080);
    Cypress.on("uncaught:exception", () => false);
  });

  it("pesan penerbangan Malaysia Airlines paling awal Jakarta -> Singapore untuk besok", () => {
    cy.visit("https://www.agoda.com", { timeout: 60000 });

    // ========== 1. Rute ==========
    cy.get("#travel-search-navigation-tab-2").should("be.visible").click();

    cy.get("#flight-origin-search-input").click().clear().type("Jakarta");
    cy.get(
      '[data-testid="autosuggest-item"][data-element-name="flight-origin-search-result"][data-objectid="CGK"]',
    )
      .first()
      .should("be.visible")
      .click();

    cy.get("#flight-destination-search-input")
      .click()
      .clear()
      .type("Singapore");
    cy.get(
      '[data-testid="autosuggest-item"][data-element-name="flight-destination-search-result"][data-objectid="SIN"]',
    )
      .first()
      .should("be.visible")
      .click();

    // ========== 2. Tanggal besok ==========
    const t = new Date();
    t.setDate(t.getDate() + 1);
    const tomorrow = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;

    cy.get('[data-testid="flight-search-calendar-drone"]', {
      timeout: 10000,
    }).should("be.visible");
    cy.get(`td[data-day="${tomorrow}"]`)
      .should("be.visible")
      .find("button")
      .should("not.be.disabled")
      .click();

    cy.contains("1 Passenger, Economy").click({ force: true });
    cy.contains("span", "SEARCH").click({ force: true });

    // ========== 3. Filter Malaysia Airlines ==========
    cy.get(CARD, { timeout: 60000 }).should("have.length.greaterThan", 0);

    cy.contains(/Show all \d+ airlines/i, { timeout: 20000 })
      .first()
      .should("be.visible")
      .click();
    cy.contains('li[role="option"]', "Malaysia Airlines")
      .should("be.visible")
      .click();

    // ========== 4. Sort departure time, ambil kartu pertama ==========
    cy.get('[data-testid="flights-quick-sort-item-other-button"]')
      .should("be.visible")
      .click();
    cy.contains("button", "Departure time").should("be.visible").click();

    // Tunggu kartu pertama selesai dirender (minimal ada jam berangkat & tiba)
    cy.get(CARD, { timeout: 30000 })
      .first()
      .should(($c) => {
        expect(
          timesIn($c[0].innerText).length,
          "jumlah jam di kartu pertama",
        ).to.be.gte(2);
      });

    // Simpan data kartu pertama + pastikan memang yang paling awal
    cy.get(CARD).then(($cards) => {
      const firstText = $cards[0].innerText;
      cy.log(`TEKS KARTU PERTAMA: ${normalize(firstText).slice(0, 300)}`);

      const [dep, arr] = timesIn(firstText);
      const price = priceIn(firstText);

      // kartu pertama harus punya departure paling kecil di antara semua kartu
      const deps = [...$cards]
        .map((c) => timesIn(c.innerText)[0])
        .filter(Boolean);
      expect(toMinutes(dep), "kartu pertama = keberangkatan paling awal").to.eq(
        Math.min(...deps.map(toMinutes)),
      );

      cy.log(`Dipilih: ${dep} -> ${arr} | ${price}`);
      cy.wrap({ dep, arr, price }).as("flight");
    });

    cy.get(CARD)
      .first()
      .find('[data-testid="flightCard-flight-detail"]')
      .click();
    cy.get('[data-testid="flight-detail-select-button"]')
      .should("be.visible")
      .click();

    // ========== 5. Halaman passenger detail ==========
    cy.url({ timeout: 30000 }).should("include", "/book");

    // Isi field, lalu pastikan nilainya benar-benar menempel (retry jika di-reset)
    const fillField = (
      testId,
      value,
      { digitsOnly = false } = {},
      attempt = 0,
    ) => {
      const sel = `[data-testid="${testId}"]`;
      const norm = (v) =>
        digitsOnly ? String(v).replace(/\D/g, "") : String(v);

      cy.get(sel, { timeout: 30000 })
        .should("be.visible")
        .then(($el) =>
          cy.wrap($el.is("input,textarea") ? $el : $el.find("input").first()),
        )
        .click()
        .clear()
        .type(value, { delay: 20 });

      cy.get(sel).then(($el) => {
        const $in = $el.is("input,textarea") ? $el : $el.find("input").first();
        if (norm($in.val()) !== norm(value) && attempt < 3) {
          cy.wait(500);
          fillField(testId, value, { digitsOnly }, attempt + 1);
        } else {
          expect(norm($in.val()), `nilai ${testId}`).to.eq(norm(value));
        }
      });
    };

    // Pilih opsi dari combobox
    const pickOption = (testId, optionText, searchFirst = false) => {
      cy.get(`[data-testid="${testId}"]`).find('[role="combobox"]').click();
      if (searchFirst) cy.get('[placeholder="Search"]').type(optionText);
      cy.contains('[role="option"]', optionText).click();
    };

    const P = "flight.forms.i0.units.i0";

    // Kontak
    fillField("contact.contactFirstName", passenger.firstName);
    fillField("contact.contactLastName", passenger.lastName);
    fillField("contact.contactEmail", passenger.email);
    fillField(
      "contact.contactPhoneNumber-PhoneNumberDataTestId",
      passenger.phone,
      { digitsOnly: true },
    );

    // Expand form penumpang HANYA jika belum terbuka (tombolnya toggle)
    cy.get("body").then(($b) => {
      const open =
        $b.find(`[data-testid="${P}.passengerFirstName"]:visible`).length > 0;
      if (!open) {
        cy.get('[data-testid="form-placeholder-expand-button-0"]').click();
      }
    });
    cy.get(`[data-testid="${P}.passengerFirstName"]`, {
      timeout: 15000,
    }).should("be.visible");

    // Data penumpang
    cy.get('[data-testid="flight.forms.i0.units.i0.passengerNationality"]')
      .find('button[role="combobox"]')
      .click();

    cy.get('input[placeholder="Search"]')
      .should("be.visible")
      .clear()
      .type(passenger.nationality);

    cy.get("li")
      .contains("span", passenger.nationality)
      .should("be.visible")
      .click();

    cy.get(`input[type="radio"][aria-label="${passenger.gender}"]`).check({
      force: true,
    });

    fillField(`${P}.passengerFirstName`, passenger.firstName);
    fillField(`${P}.passengerLastName`, passenger.lastName);

    fillField(
      `${P}.passengerDateOfBirth-DateInputDataTestId`,
      passenger.birthDay,
    );
    cy.get(
      `[data-testid="${P}.passengerDateOfBirth-MonthInputDataTestId"]`,
    ).click();
    // cy.contains('[role="option"]', passenger.birthMonth).click();
    cy.get('ul[role="listbox"][aria-label="Month"]')
      .should("be.visible")
      .contains("span", "October")
      .click();
    fillField(
      `${P}.passengerDateOfBirth-YearInputDataTestId`,
      passenger.birthYear,
    );

    // fillField(`${P}.passportNumber`, passenger.passport);
    // pickOption(`${P}.passportCountryOfIssue`, passenger.passportCountry, true);

    // fillField(
    //   `${P}.passportExpiryDate-DateInputDataTestId`,
    //   passenger.passportExpiryDay,
    // );
    // cy.get(
    //   `[data-testid="${P}.passportExpiryDate-MonthInputDataTestId"]`,
    // ).click();
    // cy.contains('[role="option"]', passenger.passportExpiryMonth).click();
    // fillField(
    //   `${P}.passportExpiryDate-YearInputDataTestId`,
    //   passenger.passportExpiryYear,
    // );

    // Bukti visual bahwa form terisi
    cy.screenshot("passenger-form-filled", { capture: "fullPage" });

    // Simpan total price di halaman passenger detail
    readTotalPrice().then((p) => cy.wrap(p).as("totalPrice"));

    // ========== 6. Lanjut sampai halaman pilih pembayaran ==========
    const goToPayment = (attempt = 0) => {
      cy.url().then((url) => {
        if (/payment/i.test(url) || attempt >= 5) return;

        cy.get("body").then(($b) => {
          // tombol lanjut / skip add-on (baggage, seat, insurance) bila ada
          const $btn = $b
            .find("button")
            .filter(":visible")
            .filter((_, el) =>
              /^(continue|next|proceed|no,? thanks|skip)/i.test(
                normalize(el.innerText),
              ),
            )
            .first();
          if ($btn.length) cy.wrap($btn).click({ force: true });
          cy.wait(1500); // beri waktu transisi halaman
          goToPayment(attempt + 1);
        });
      });
    };
    goToPayment();

    cy.contains(/payment method|select payment|choose payment/i, {
      timeout: 30000,
    }).should("be.visible");

    // ========== 7. Verifikasi di halaman pembayaran ==========
    cy.get("@flight").then(({ dep, arr }) => {
      cy.get("@totalPrice").then((totalPrice) => {
        cy.get("body").should(($b) => {
          const text = normalize($b.text());
          const lower = text.toLowerCase();
          const noSep = text.replace(/[.,]/g, "");

          // total price
          expect(noSep, "total price").to.include(totalPrice);

          // departure & arrival time sama dengan yang dipilih
          expect(text, "departure time").to.include(dep);
          expect(text, "arrival time").to.include(arr);

          // data penumpang
          expect(lower, "first name").to.include(
            passenger.firstName.toLowerCase(),
          );
          expect(lower, "last name").to.include(
            passenger.lastName.toLowerCase(),
          );
          expect(lower, "email").to.include(passenger.email.toLowerCase());
        });
      });
    });
  });
});
