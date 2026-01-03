import React, { useState, useEffect } from 'react';
import { fetchProductsFromSheet } from '../utils/sheetService';
import { Product } from '../types';
import { Search, ScanBarcode, RefreshCw, AlertCircle, Settings, Save, RotateCcw, FileSpreadsheet, CheckCircle, ExternalLink, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui';

// Varsayılan (Public) Sheet ID
const DEFAULT_SHEET_ID = '1YTgNy_StjC3UChBdM8h9cieZWMo7IrfJPDVhuq-aH0c';

export const PsfView = () => {
    // LocalStorage'da özel ID varsa onu kullan, yoksa varsayılanı kullan
    const [currentSheetId, setCurrentSheetId] = useState(localStorage.getItem('psf_sheet_id') || DEFAULT_SHEET_ID);
    const [tempSheetId, setTempSheetId] = useState(currentSheetId);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    // Initial load ve ID değiştiğinde çalışır
    useEffect(() => {
        if (!isSettingsOpen) {
            loadData();
        }
    }, [currentSheetId, isSettingsOpen]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchProductsFromSheet(currentSheetId);
            setProducts(data);
            setLastUpdated(new Date().toLocaleTimeString());
        } catch (err) {
            setError('Veri çekilemedi. Sheet ID veya paylaşım ayarlarını kontrol edin.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = () => {
        const idToSave = tempSheetId.trim();
        if (!idToSave) return;
        
        localStorage.setItem('psf_sheet_id', idToSave);
        setCurrentSheetId(idToSave);
        setIsSettingsOpen(false);
    };

    const handleResetSettings = () => {
        localStorage.removeItem('psf_sheet_id');
        setTempSheetId(DEFAULT_SHEET_ID);
        setCurrentSheetId(DEFAULT_SHEET_ID);
        setIsSettingsOpen(false);
    };

    const filteredProducts = products.filter(p => 
        p.name.toLocaleLowerCase('tr-TR').includes(searchTerm.toLocaleLowerCase('tr-TR')) ||
        p.barcode.includes(searchTerm)
    );

    // --- AYARLAR EKRANI ---
    if (isSettingsOpen) {
        return (
            <div className="p-6 pb-24 h-full animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => setIsSettingsOpen(false)} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
                        <ChevronRight className="rotate-180" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-heading font-black text-slate-800 tracking-tight">Veri Ayarları</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Kendi Listenizi Bağlayın</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-4xl shadow-sm border border-slate-100">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Google Sheet ID</label>
                        <div className="relative mb-4">
                            <input 
                                value={tempSheetId}
                                onChange={(e) => setTempSheetId(e.target.value)}
                                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none font-mono text-sm text-slate-600"
                                placeholder="Spreadsheet ID buraya..."
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={handleSaveSettings} className="flex-1 bg-teal-600 text-white">
                                <Save size={18} /> KAYDET
                            </Button>
                            {currentSheetId !== DEFAULT_SHEET_ID && (
                                <button onClick={handleResetSettings} className="px-4 bg-slate-100 text-slate-500 rounded-2xl font-bold active:scale-95 transition-transform">
                                    <RotateCcw size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-indigo-50 p-6 rounded-4xl border border-indigo-100">
                        <h3 className="flex items-center gap-2 font-heading font-bold text-indigo-800 mb-4">
                            <FileSpreadsheet size={20} />
                            Nasıl Yapılır?
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <span className="bg-white text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">1</span>
                                <div className="text-sm text-indigo-900/80">
                                    <strong>Google Sheet Oluşturun:</strong> <br/>
                                    İlk satıra başlıkları yazın. Sırası çok önemlidir:
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {['A: Barkod', 'B: Ürün Adı', 'C: PSF', 'D: KDV', 'E: Grup'].map((h, i) => (
                                            <span key={i} className="bg-white/60 px-2 py-1 rounded text-[10px] font-bold border border-indigo-100">{h}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <span className="bg-white text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">2</span>
                                <div className="text-sm text-indigo-900/80">
                                    <strong>Paylaşıma Açın:</strong> <br/>
                                    Dosya &gt; Paylaş &gt; Genel Erişim &gt; <em>"Bağlantıya sahip olan herkes"</em> seçeneğini işaretleyin.
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <span className="bg-white text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">3</span>
                                <div className="text-sm text-indigo-900/80 break-all">
                                    <strong>ID'yi Kopyalayın:</strong> <br/>
                                    Tarayıcı adres çubuğundaki şu kısmı kopyalayın:<br/>
                                    <span className="font-mono text-[10px] bg-white/50 px-1 rounded">docs.google.com/spreadsheets/d/</span><span className="font-mono text-[10px] bg-yellow-200 px-1 rounded mx-0.5 border border-yellow-300">ID_BURADA</span><span className="font-mono text-[10px] bg-white/50 px-1 rounded">/edit...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- ARAMA EKRANI ---
    return (
        <div className="p-4 pb-24 h-full flex flex-col">
            {/* Search Header */}
            <div className="sticky top-0 bg-slate-50/95 backdrop-blur-sm pt-2 pb-4 z-10 space-y-3">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Barkod veya Ürün Adı Ara..."
                        className="w-full pl-12 pr-4 py-4 rounded-3xl bg-white border border-slate-200 shadow-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none font-bold text-slate-800 placeholder:font-medium"
                        autoFocus
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 font-bold px-2">X</button>
                    )}
                </div>
                
                <div className="flex items-center justify-between px-2">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        {loading ? 'Yükleniyor...' : `${filteredProducts.length} Ürün`}
                        <span className="text-slate-300 mx-1">•</span>
                        {currentSheetId === DEFAULT_SHEET_ID ? 'Genel Liste' : 'Özel Liste'}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={loadData} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 active:scale-95 transition-transform"><RefreshCw size={16} /></button>
                        <button onClick={() => setIsSettingsOpen(true)} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 active:scale-95 transition-transform relative">
                            <Settings size={16} />
                            {currentSheetId !== DEFAULT_SHEET_ID && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-teal-500 rounded-full border-2 border-white"></span>}
                        </button>
                    </div>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="space-y-3 mt-2">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="h-24 bg-white rounded-3xl border border-slate-100 animate-pulse"></div>
                    ))}
                </div>
            ) : error ? (
                <div className="text-center mt-10 p-6 bg-rose-50 rounded-3xl border border-rose-100">
                    <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
                    <p className="text-rose-600 font-bold">{error}</p>
                    <button onClick={() => setIsSettingsOpen(true)} className="mt-4 text-rose-700 underline text-sm font-bold">Ayarları Kontrol Et</button>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center mt-10 opacity-50">
                    <ScanBarcode className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-bold">Sonuç bulunamadı</p>
                    <p className="text-xs text-slate-400 mt-2">Aradığınız ürün listede yoksa Sheet'in ilk sayfasında olduğundan emin olun.</p>
                </div>
            ) : (
                <div className="space-y-3 animate-fade-in">
                    {filteredProducts.map((p, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center group active:scale-[0.99] transition-transform">
                            <div className="flex-1 pr-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg text-[10px] font-black tracking-widest">{p.group}</span>
                                    {p.vat > 0 && <span className="bg-teal-50 text-teal-600 px-2 py-0.5 rounded-lg text-[10px] font-black tracking-widest">%{p.vat} KDV</span>}
                                </div>
                                <h3 className="font-heading font-extrabold text-slate-800 leading-tight mb-1">{p.name}</h3>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 font-mono">
                                    <ScanBarcode size={12} />
                                    {p.barcode}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-heading font-black text-teal-600 tracking-tight">{p.psf.toFixed(2)} ₺</div>
                                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-0.5">PSF</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};