const prompt = require("prompt-sync")();

function penjumlahan(a, b) {
    return a + b;
}

function pengurangan(a, b) {
    return a - b;
}

function perkalian(a, b) {
    return a * b;
}

function pembagian(a, b) {
    if (b === 0) {
        return "Error: tidak bisa dibagi dengan 0";
    }
    return a / b;
}

console.log("=== KALKULATOR SEDERHANA ===");
console.log("Pilih operasi:");
console.log("1. Penjumlahan");
console.log("2. Pengurangan");
console.log("3. Perkalian");
console.log("4. Pembagian");

let pilihan = parseInt(prompt("Masukkan pilihan operasi (1-4):"));
let angka1 = parseFloat(prompt("Masukkan angka pertama:"));
let angka2 = parseFloat(prompt("Masukkan angka kedua:"));

let hasil;
let namaOperasi;

switch (pilihan) {
    case 1:
        namaOperasi = "Penjumlahan";
        hasil = penjumlahan(angka1, angka2);
        break;

    case 2:
        namaOperasi = "Pengurangan";
        hasil = pengurangan(angka1, angka2);
        break;

    case 3:
        namaOperasi = "Perkalian";
        hasil = perkalian(angka1, angka2);
        break;

    case 4:
        namaOperasi = "Pembagian";
        hasil = pembagian(angka1, angka2);
        break;

    default:
        namaOperasi = "Tidak valid";
        hasil = "Pilihan operasi tidak tersedia";
}

console.log("\n=== HASIL PERHITUNGAN ===");
console.log("Operasi: " + namaOperasi);
console.log("Angka 1: " + angka1);
console.log("Angka 2: " + angka2);
console.log("Hasil: " + hasil);