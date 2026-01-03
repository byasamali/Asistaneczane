import { Product } from "../types";

/**
 * Verilen input'tan Sheet ID ve GID (Sayfa ID) bilgilerini ayıklar.
 */
function extractSheetInfo(input: string): { sheetId: string, gid: string } {
    if (!input) return { sheetId: "", gid: "" };
    const cleanInput = input.trim();
    
    // ID Ayıklama
    let sheetId = cleanInput;
    const idMatch = cleanInput.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (idMatch) {
        sheetId = idMatch[1];
    }

    // GID Ayıklama
    let gid = "0"; // Varsayılan GID 0
    const gidMatch = cleanInput.match(/[?&]gid=([0-9]+)/);
    if (gidMatch) {
        gid = gidMatch[1];
    }

    return { sheetId, gid };
}

/**
 * CSV satırını parse eder (Tırnak ve virgül yönetimi)
 */
function parseCSVRow(rowText: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < rowText.length; i++) {
        const char = rowText[i];
        const nextChar = rowText[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

/**
 * CSV metnini diziye çevirir
 */
function parseCSV(text: string): string[][] {
    // Satırları ayır (CRLF veya LF)
    const lines = text.split(/\r?\n/);
    return lines.map(line => parseCSVRow(line)).filter(row => row.length > 0);
}

/**
 * Google Sheet'ten veri çeker (CSV formatında)
 * Beklenen sütun sırası: Barkod, Ürün Adı, PSF, KDV, Ürün Grubu
 */
export async function fetchProductsFromSheet(inputUrl: string): Promise<Product[]> {
  try {
    const { sheetId, gid } = extractSheetInfo(inputUrl);
    
    if (!sheetId) throw new Error("Geçersiz Sheet ID veya Link.");

    // CSV Export endpoint - "Bağlantıya sahip olan herkes" erişimi için daha kararlı
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        // Eğer 200 dönmediyse, muhtemelen yetki hatası veya geçersiz ID
        if (response.status === 401 || response.status === 403) {
            throw new Error(`Erişim reddedildi. Lütfen dosya paylaşım ayarlarını "Bağlantıya sahip olan herkes görüntüleyen" olarak ayarlayın.`);
        }
        throw new Error(`Veri çekilemedi (Hata: ${response.status}). Linki kontrol edin.`);
    } else {
        // Bazen Google login sayfasına yönlendirir (200 OK döner ama içerik HTML'dir)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
             throw new Error(`Erişim hatası. Dosya herkese açık paylaşılmamış olabilir.`);
        }
    }
    
    const text = await response.text();
    const rows = parseCSV(text);
    
    const products: Product[] = [];

    // İlk satır başlık olabilir, kontrol edelim
    const startIndex = rows.length > 0 && (rows[0][0].toLowerCase().includes('barkod') || rows[0][2].toLowerCase().includes('fiyat')) ? 1 : 0;

    for (let i = startIndex; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 3) continue;

        const barcode = row[0];
        const name = row[1];
        
        // Fiyat temizleme (1.234,56 veya 1234.56 formatları)
        let psfStr = row[2].replace('₺', '').trim();
        // Virgül ondalık ayracı ise noktaya çevir, binlik ayracı nokta ise kaldır
        // Basit yaklaşım: Sadece virgülü noktaya çevir
        if (psfStr.includes(',')) {
             psfStr = psfStr.replace(',', '.');
        }
        const psf = parseFloat(psfStr);

        let vat = 0;
        if (row.length > 3) {
            vat = parseFloat(row[3].replace('%', '').replace(',', '.')) || 0;
        }

        const group = row.length > 4 ? row[4] : "Genel";

        if (barcode && name && !isNaN(psf)) {
            products.push({ barcode, name, psf, vat, group });
        }
    }

    return products;
  } catch (error: any) {
    console.error("Sheet Fetch Error:", error);
    throw new Error(error.message || "Bilinmeyen bir hata oluştu.");
  }
}