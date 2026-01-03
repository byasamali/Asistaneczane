import { Product } from "../types";

/**
 * Verilen input'tan Sheet ID ve GID (Sayfa ID) bilgilerini ayıklar.
 */
function extractSheetInfo(input: string): { sheetId: string, gid: string } {
    if (!input) return { sheetId: "", gid: "" };
    const cleanInput = input.trim();
    
    // ID Ayıklama
    let sheetId = cleanInput;
    // Eğer tam URL ise regex ile ID'yi al, değilse kendisi ID'dir.
    const idMatch = cleanInput.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (idMatch) {
        sheetId = idMatch[1];
    }

    // GID Ayıklama (Sadece URL ise vardır)
    let gid = "";
    const gidMatch = cleanInput.match(/[?&]gid=([0-9]+)/);
    if (gidMatch) {
        gid = gidMatch[1];
    }

    return { sheetId, gid };
}

/**
 * Google Sheet'ten veri çeker.
 * Beklenen sütun sırası: Barkod, Ürün Adı, PSF, KDV, Ürün Grubu
 */
export async function fetchProductsFromSheet(inputUrl: string): Promise<Product[]> {
  try {
    const { sheetId, gid } = extractSheetInfo(inputUrl);
    
    if (!sheetId) throw new Error("Geçersiz Sheet ID veya Link.");

    // Google Visualization API endpoint
    // gid parametresi eklenerek doğru sayfa hedeflenir
    let url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
    if (gid) {
        url += `&gid=${gid}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erişim hatası (Kod: ${response.status}). Sheet "Web'de Yayınla" yapılmış mı?`);
    }
    
    const text = await response.text();
    
    // JSONP temizliği: /*O_o*/ ve google.visualization.Query.setResponse(...) kısımlarını temizle
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    
    if (start === -1 || end === -1) {
        throw new Error("Veri formatı hatalı veya Sheet yayınlanmamış.");
    }

    const jsonText = text.substring(start, end + 1);
    const json = JSON.parse(jsonText);
    
    if (!json.table || !json.table.rows) {
        return [];
    }

    const rows = json.table.rows;
    const products: Product[] = [];

    rows.forEach((row: any) => {
      const c = row.c;
      if (c && c.length >= 3) {
         // Hücre boşsa null gelebilir, güvenli erişim sağlayalım
         const barcode = c[0]?.v ? String(c[0].v).trim() : "";
         const name = c[1]?.v ? String(c[1].v).trim() : "İsimsiz Ürün";
         
         // Fiyat sayısal olmalı
         let psf = 0;
         if (c[2]?.v) {
             if (typeof c[2].v === 'number') psf = c[2].v;
             else psf = parseFloat(String(c[2].v).replace(',', '.'));
         }

         const vat = c[3]?.v ? Number(c[3].v) : 0; 
         const group = c[4]?.v ? String(c[4].v) : "Genel";

         // Başlık satırını atla (Eğer fiyat sayı değilse başlıktır)
         // Ayrıca barkod ve isim dolu olmalı
         if (barcode && name && !isNaN(psf)) {
             products.push({ barcode, name, psf, vat, group });
         }
      }
    });

    return products;
  } catch (error) {
    console.error("Sheet Fetch Error:", error);
    throw error;
  }
}