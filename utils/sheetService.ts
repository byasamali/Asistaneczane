import { Product } from "../types";

/**
 * Google Sheet'ten veri çeker.
 * Beklenen sütun sırası: Barkod, Ürün Adı, PSF, KDV, Ürün Grubu
 */
export async function fetchProductsFromSheet(sheetId: string): Promise<Product[]> {
  try {
    // Google Visualization API endpoint (public sheets)
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Sheet verisine erişilemedi. ID'yi ve paylaşım ayarlarını kontrol edin.");
    }
    
    const text = await response.text();
    
    // Google'ın döndürdüğü JSONP benzeri yapıyı temizle: /*O_o*/ ve fonksiyon sarmalayıcısını kaldır
    const jsonText = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const json = JSON.parse(jsonText);
    
    const rows = json.table.rows;
    const products: Product[] = [];

    rows.forEach((row: any) => {
      const c = row.c;
      if (c && c.length >= 3) { // En az Barkod, İsim ve Fiyat olmalı
         // Hücre boşsa null gelebilir, güvenli erişim sağlayalım
         const barcode = c[0]?.v ? String(c[0].v) : "";
         const name = c[1]?.v ? String(c[1].v) : "İsimsiz Ürün";
         const psf = c[2]?.v ? Number(c[2].v) : 0;
         const vat = c[3]?.v ? Number(c[3].v) : 0; // KDV opsiyonel
         const group = c[4]?.v ? String(c[4].v) : "Genel"; // Grup opsiyonel

         if (barcode && name) {
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