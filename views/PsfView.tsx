import React, { useState, useEffect, useRef } from 'react';
import { fetchProductsFromSheet } from '../utils/sheetService';
import { Product } from '../types';
import { Search, ScanBarcode, RefreshCw, AlertCircle, Settings, Save, RotateCcw, FileSpreadsheet, ChevronRight, Star, Camera, X, Database, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui';
import { Html5Qrcode } from 'html5-qrcode';

// Sizin verdiğiniz varsayılan adres
const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1YTgNy_StjC3UChBdM8h9cieZWMo7IrfJPDVhuq-aH0c/edit?gid=0#gid=0';

export const PsfView = () => {
    // LocalStorage'dan ID'yi al veya varsayılanı kullan
    const [currentSheetId, setCurrentSheetId] = useState(() => {
        const saved = localStorage.getItem('psf_sheet_id');
        return saved && saved.trim() !== "" ? saved : DEFAULT_SHEET_URL;
    });
    const [tempSheetId, setTempSheetId] = useState(currentSheetId);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    const [favorites, setFavorites] = useState<Product[]>(() => {
        const saved = localStorage.getItem('psf_favorites');
        return saved ? JSON.parse(saved) : [];
    });
    
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [showScanner, setShowScanner] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        if (!isSettingsOpen) {
            loadData();
        }
    }, [currentSheetId, isSettingsOpen]);

    useEffect(() => {
        localStorage.setItem('psf_favorites', JSON.stringify(favorites));
    }, [favorites]);

    useEffect(() => {
        if (showScanner) {
            const startScanner = async () => {
                try {
                    const html5QrCode = new Html5Qrcode("reader");
                    scannerRef.current = html5QrCode;
                    
                    await html5QrCode.start(
                        { facingMode: "environment" },
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 },
                            aspectRatio: 1.0
                        },
                        (decodedText) => {
                            setSearchTerm(decodedText);
                            setShowScanner(false);
                            html5QrCode.stop().then(() => html5QrCode.clear());
                        },
                        () => {}
                    );
                } catch (err) {
                    setError("Kamera başlatılamadı. İzinleri kontrol edin.");
                    setShowScanner(false);
                }
            };
            setTimeout(startScanner, 100);
        } else {
            if (scannerRef.current) {
                if (scannerRef.current.isScanning) {
                     scannerRef.current.stop().then(() => scannerRef.current?.clear());
                } else {
                    scannerRef.current.clear();
                }
                scannerRef.current = null;
            }
        }
    }, [showScanner]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchProductsFromSheet(currentSheetId);
            if (data.length === 0) {
                setError('Veri bulunamadı. Lütfen sayfa linkini ve paylaşım izinlerini kontrol ediniz.');
            } else {
                setProducts(data);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Veri çekilemedi. Bağlantı ayarlarını kontrol ediniz.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = () => {
        const idToSave = tempSheetId.trim();
        if (!idToSave) {
            localStorage.setItem('psf_sheet_id', DEFAULT_SHEET_URL);
            setCurrentSheetId(DEFAULT_SHEET_URL);
        } else {
            localStorage.setItem('psf_sheet_id', idToSave);
            setCurrentSheetId(idToSave);
        }
        setIsSettingsOpen(false);
    };

    const handleResetSettings = () => {
        localStorage.setItem('psf_sheet_id', DEFAULT_SHEET_URL);
        setTempSheetId(DEFAULT_SHEET_URL);
        setCurrentSheetId(DEFAULT_SHEET_URL);
        setIsSettingsOpen(false);
    };

    const toggleFavorite = (product: Product) => {
        setFavorites(prev => {
            const exists = prev.find(p => p.barcode === product.barcode);
            if (exists) {
                return prev.filter(p => p.barcode !== product.barcode);
            } else {
                return [...prev, product];
            }
        });
    };

    const filteredProducts = products.filter(p => 
        p.name.toLocaleLowerCase('tr-TR').includes(searchTerm.toLocaleLowerCase('tr-TR')) ||
        p.barcode.includes(searchTerm)
    );

    const displayList = searchTerm ? filteredProducts : favorites;
    const isShowingFavorites = !searchTerm;

    if (showScanner) {
        return (
            <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center">
                <div className="absolute top-6 right-6 z-10">
                    <button onClick={() => setShowScanner(false)} className="bg-white/20 p-3 rounded-full text-white backdrop-blur-sm">
                        <X size={24} />
                    </button>
                </div>
                <div className="text-white font-heading font-bold mb-4 text-xl">Barkodu Okutun</div>
                <div id="reader" className="w-full max-w-sm rounded-3xl overflow-hidden border-2 border-teal-500"></div>
            </div>
        );
    }

    if (isSettingsOpen) {
        return (
            <div className="p-6 pb-24 h-full animate-fade-in text-slate-200">
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => setIsSettingsOpen(false)} className="p-2 -ml-2 text-slate-500 hover:text-slate-300">
                        <ChevronRight className="rotate-180" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-heading font-black text-slate-100 tracking-tight">Veri Kaynağı</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Google Sheet Bağlantısı</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900 p-6 rounded-4xl shadow-xl border border-slate-800">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Sheet Linki (Tam Adres)</label>
                        <div className="relative mb-4">
                            <input 
                                value={tempSheetId}
                                onChange={(e) => setTempSheetId(e.target.value)}
                                className="w-full p-4 rounded-2xl bg-slate-800 border border-slate-700 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none font-mono text-xs text-white break-all"
                                placeholder="https://docs.google.com/spreadsheets/d/..."
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={handleSaveSettings} className="flex-1 bg-teal-600">
                                <Save size={18} /> KAYDET
                            </Button>
                            <button 
                                onClick={handleResetSettings} 
                                title="Varsayılan Adresi Yükle"
                                className="px-5 bg-slate-800 text-slate-400 rounded-2xl font-bold active:scale-95 transition-transform border border-slate-700 flex items-center justify-center"
                            >
                                <RotateCcw size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="bg-amber-950/20 p-6 rounded-4xl border border-amber-900/20">
                         <h3 className="flex items-center gap-2 font-heading font-bold text-amber-400 mb-2">
                            <AlertCircle size={20} />
                            Nasıl Paylaşılır?
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium mb-3">
                            Verilerin çekilebilmesi için dosyanın paylaşım ayarlarının açık olması gerekir (Web'de Yayınla yapmanıza gerek yoktur).
                        </p>
                        <div className="bg-amber-900/20 p-3 rounded-xl border border-amber-900/30">
                            <ol className="text-[10px] text-slate-300 space-y-1 list-decimal ml-3">
                                <li>Dosyanızda sağ üstten <strong>Paylaş</strong> butonuna basın.</li>
                                <li>"Genel Erişim" kısmını <strong>"Bağlantıya sahip olan herkes"</strong> olarak değiştirin.</li>
                                <li><strong>Bağlantıyı kopyala</strong> diyerek buraya yapıştırın.</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 pb-24 h-full flex flex-col">
            <div className="sticky top-0 bg-[#0f172a]/95 backdrop-blur-md pt-2 pb-4 z-10 space-y-3">
                <div className="relative flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Ürün veya Barkod Ara..."
                            className="w-full pl-12 pr-4 py-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none font-bold text-slate-100 placeholder:text-slate-700"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold px-2">X</button>
                        )}
                    </div>
                    <button 
                        onClick={() => setShowScanner(true)}
                        className="bg-slate-800 text-white p-4 rounded-3xl active:scale-95 transition-transform shadow-lg border border-slate-700"
                    >
                        <Camera size={20} />
                    </button>
                </div>
                
                <div className="flex items-center justify-between px-2">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        {isShowingFavorites 
                            ? (favorites.length > 0 ? 'Hızlı Erişim' : (products.length > 0 ? `${products.length} Ürün Aktif` : 'Veri Bekleniyor'))
                            : (loading ? 'Veriler Güncelleniyor...' : `${filteredProducts.length} Ürün Bulundu`)
                        }
                    </div>
                    <div className="flex gap-2">
                        <button onClick={loadData} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 active:scale-95"><RefreshCw size={16} /></button>
                        <button onClick={() => setIsSettingsOpen(true)} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 active:scale-95 relative">
                            <Settings size={16} />
                            {currentSheetId !== DEFAULT_SHEET_URL && <span className="absolute top-0 right-0 w-2 h-2 bg-teal-500 rounded-full border-2 border-slate-900"></span>}
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4 mt-2">
                    {[1,2,3].map(i => (
                        <div key={i} className="h-28 bg-slate-900 rounded-[2.5rem] border border-slate-800 animate-pulse"></div>
                    ))}
                </div>
            ) : error ? (
                <div className="text-center mt-10 p-8 bg-rose-950/20 rounded-4xl border border-rose-900/20 animate-fade-in">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                    <p className="text-rose-400 font-bold text-sm mb-4 leading-snug">{error}</p>
                    <button onClick={() => setIsSettingsOpen(true)} className="bg-rose-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-colors">
                        Ayarları Kontrol Et
                    </button>
                </div>
            ) : displayList.length === 0 ? (
                <div className="text-center mt-12 opacity-30 animate-fade-in">
                    {isShowingFavorites ? (
                        <>
                             {products.length > 0 ? (
                                <>
                                    <Search className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                                    <p className="text-slate-400 font-bold text-sm">Veritabanında {products.length} ürün var.<br/>Aramak için yukarıya yazın.</p>
                                </>
                             ) : (
                                <>
                                    <Star className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                                    <p className="text-slate-400 font-bold text-sm">Veri yüklenemedi veya liste boş.</p>
                                </>
                             )}
                        </>
                    ) : (
                        <>
                            <ScanBarcode className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400 font-bold">Sonuç bulunamadı.</p>
                        </>
                    )}
                </div>
            ) : (
                <div className="space-y-4 animate-fade-in mt-2">
                    {displayList.map((p, idx) => {
                        const isFav = favorites.some(fav => fav.barcode === p.barcode);
                        return (
                            <div key={idx} className="bg-slate-900 p-5 rounded-[2.5rem] shadow-xl border border-slate-800/60 flex justify-between items-center group active:scale-[0.99] transition-transform relative overflow-hidden">
                                <div className="flex-1 pr-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest">{p.group}</span>
                                        {p.vat > 0 && <span className="text-teal-500/60 text-[8px] font-black">%{p.vat} KDV</span>}
                                    </div>
                                    <h3 className="font-heading font-extrabold text-slate-100 text-base leading-tight mb-1">{p.name}</h3>
                                    <div className="text-[10px] font-bold text-slate-600 font-mono flex items-center gap-1">
                                        <ScanBarcode size={12} /> {p.barcode}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-3">
                                    <div className="text-right">
                                        <div className="text-xl font-heading font-black text-teal-400">{p.psf.toFixed(2)} ₺</div>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleFavorite(p); }}
                                        className={`p-2.5 rounded-2xl transition-all border ${isFav ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-slate-800 text-slate-600 border-slate-700'}`}
                                    >
                                        <Star size={16} fill={isFav ? "currentColor" : "none"} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};