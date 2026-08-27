const prompt = require("prompt-sync")();

function tentukanKategori(usia) {
  if (usia >= 0 && usia <= 12) {
    return "Anak-anak";
  } else if (usia >= 13 && usia <= 17) {
    return "Remaja";
  } else if (usia >= 18 && usia <= 59) {
    return "Dewasa";
  } else if (usia >= 60) {
    return "Lansia";
  } else {
    return "Usia tidak valid";
  }
}

let jumlahOrang = parseInt(prompt("Masukkan jumlah orang:"));

let anak = 0;
let remaja = 0;
let dewasa = 0;
let lansia = 0;

for (let i = 1; i <= jumlahOrang; i++) {
  let usia = parseInt(prompt("Masukkan usia orang ke-" + i + ":"));
  let kategori = tentukanKategori(usia);

  if (kategori === "Anak-anak") {
    anak++;
  } else if (kategori === "Remaja") {
    remaja++;
  } else if (kategori === "Dewasa") {
    dewasa++;
  } else if (kategori === "Lansia") {
    lansia++;
  }

  console.log("Orang ke-" + i + ": " + kategori);
}

console.log("\n=== Jumlah Orang per Kategori ===");
console.log("Anak-anak: " + anak + " orang");
console.log("Remaja: " + remaja + " orang");
console.log("Dewasa: " + dewasa + " orang");
console.log("Lansia: " + lansia + " orang");
