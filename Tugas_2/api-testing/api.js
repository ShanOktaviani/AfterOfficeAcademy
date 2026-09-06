require("dotenv").config();
const request = require("supertest");
const expect = require("chai").expect;

const baseUrl = process.env.BASE_URL;

let header = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

const bookingData = require('./data/booking.json')

describe("Booking API E2E Test", () => {
  let token;
  let bookingId;

  context("auth", () => {
    it("1. Should authenticate user and get token", async function () {
      const response = await request(baseUrl).post("/auth").send({
        username: process.env.USERNAME,
        password: process.env.PASSWORD,
      });

      expect(response.status).to.equal(200);

      expect(response.body).to.have.property("token");
      expect(response.body.token).to.be.a("string");
      expect(response.body.token).to.not.be.empty;

      token = response.body.token;
    });
  });

  context("createBooking", () => {
    it("2. Should create a new booking", async function () {
      const response = await request(baseUrl)
        .post("/booking")
        .set(header)
        .send(bookingData);

      expect(response.status).to.equal(200);

      expect(response.body).to.have.property("bookingid");
      expect(response.body.bookingid).to.be.a("number");

      bookingId = response.body.bookingid;

      expect(response.body).to.have.property("booking");

      expect(response.body.booking).to.deep.equal(bookingData);
    });

    context("getBooking", () => {
      it("3. Should get booking by bookingId", async function () {
        expect(bookingId).to.exist;

        const response = await request(baseUrl).get(`/booking/${bookingId}`).set(header);

        expect(response.status).to.equal(200);

        expect(response.body).to.deep.equal(bookingData);
      });
    });

    context("deleteBooking", () => {
      it("4. Should delete booking", async function () {
        expect(token).to.exist;

        expect(bookingId).to.exist;

        const response = await request(baseUrl)
          .delete(`/booking/${bookingId}`)
          .set("Cookie", `token=${token}`);

        expect(response.status).to.equal(201);
      });
    });
  });
});
