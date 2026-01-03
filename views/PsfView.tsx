import React, { useState, useEffect, useRef } from 'react';
import { fetchProductsFromSheet } from '../utils/sheetService';
import { Product } from '../types';
import { Search, ScanBarcode, RefreshCw, AlertCircle, Settings, Save, RotateCcw, FileSpreadsheet, ChevronRight, Star, Camera, X } from 'lucide-react';
import { Button } from '../components/ui';
import { Html5Qrcode } from 'html5-qrcode';

// Varsayılan (Public) Sheet ID
const DEFAULT_SHEET_ID = '1YTgNy_StjC3UChBdM8h9cieZWMo7IrfJPDVhuq-aH0c';

export const PsfView = () => {
    // LocalStorage ve State Tanımları
    const [currentSheetId, setCurrentSheetId] = useState(localStorage.getItem('psf_sheet_id') || DEFAULT_SHEET_ID);
    const [tempSheetId, setTempSheetId] = useState(currentSheetId);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    // Favoriler (Sık Kullanılanlar)
    const [favorites, setFavorites] = useState<Product[]>(() => {
        const saved = localStorage.getItem('psf_favorites');
        return saved ? JSON.parse(saved) : [];
    });
    
    // Veri ve Arama
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    // Kamera / Scanner
    const [showScanner, setShowScanner] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    // Initial load
    useEffect(() => {
        if (!isSettingsOpen) {
            loadData();
        }
    }, [currentSheetId, isSettingsOpen]);

    // Favorileri Kaydetme
    useEffect(() => {
        localStorage.setItem('psf_favorites', JSON.stringify(favorites));
    }, [favorites]);

    // Scanner Başlatma / Durdurma
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
                            // Başarılı okuma
                            setSearchTerm(decodedText);
                            setShowScanner(false);
                            html5QrCode.stop().then(() => html5QrCode.clear());
                        },
                        (errorMessage) => {
                            // Okuma hatası (görmezden gelinebilir, sürekli tetiklenir)
                        }
                    );
                } catch (err) {
                    console.error("Kamera başlatılamadı", err);
                    setError("Kamera başlatılamadı. İzinleri kontrol edin.");
                    setShowScanner(false);
                }
            };
            
            // DOM render olduktan sonra biraz bekle
            setTimeout(startScanner, 100);
        } else {
            // Scanner kapatıldığında temizle
            if (scannerRef.current) {
                if (scannerRef.current.isScanning) {
                     scannerRef.current.stop().then(() => scannerRef.current?.clear());
                } else {
                    scannerRef.current.clear();
                }
                scannerRef.current = null;
            }
        }
        
        return () => {
             if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().then(() => scannerRef.current?.clear());
            }
        };
    }, [showScanner]);

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

    // Görüntülenecek Liste: Arama varsa sonuçlar, yoksa favoriler
    const displayList = searchTerm ? filteredProducts : favorites;
    const isShowingFavorites = !searchTerm;

    // --- SCANNER MODAL ---
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
                <div className="mt-6 text-white/50 text-sm">Kamera otomatik odaklanacaktır</div>
            </div>
        );
    }

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
                    {/* Yardım metni aynı kalabilir, kısalık için burayı özet geçiyorum */}
                    <div className="bg-indigo-50 p-6 rounded-4xl border border-indigo-100">
                         <h3 className="flex items-center gap-2 font-heading font-bold text-indigo-800 mb-2">
                            <FileSpreadsheet size={20} />
                            Nasıl Yapılır?
                        </h3>
                        <p className="text-sm text-indigo-900/80">
                            Google Sheet oluşturun, başlıkları (Barkod, İsim, PSF, KDV, Grup) ekleyin ve "Bağlantıya sahip herkes" olarak paylaşıp ID'yi buraya yapıştırın.
                        </p>
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
                <div className="relative flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Barkod veya Ürün Adı..."
                            className="w-full pl-12 pr-4 py-4 rounded-3xl bg-white border border-slate-200 shadow-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none font-bold text-slate-800 placeholder:font-medium"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 font-bold px-2">X</button>
                        )}
                    </div>
                    <button 
                        onClick={() => setShowScanner(true)}
                        className="bg-slate-800 text-white p-4 rounded-3xl active:scale-95 transition-transform shadow-lg shadow-slate-200"
                    >
                        <Camera size={20} />
                    </button>
                </div>
                
                <div className="flex items-center justify-between px-2">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        {isShowingFavorites 
                            ? (favorites.length > 0 ? 'Sık Kullanılanlar' : 'Arama Geçmişi')
                            : (loading ? 'Yükleniyor...' : `${filteredProducts.length} Sonuç`)
                        }
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
            ) : displayList.length === 0 ? (
                <div className="text-center mt-10 opacity-50">
                    {isShowingFavorites ? (
                        <>
                            <Star className="w-16 h-16 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 font-bold text-sm">Henüz favori ürününüz yok.</p>
                            <p className="text-[10px] text-slate-300 mt-2">Ürünleri arayıp yıldıza tıklayarak ekleyebilirsiniz.</p>
                        </>
                    ) : (
                        <>
                            <ScanBarcode className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-bold">Sonuç bulunamadı</p>
                        </>
                    )}
                </div>
            ) : (
                <div className="space-y-3 animate-fade-in">
                    {displayList.map((p, idx) => {
                        const isFav = favorites.some(fav => fav.barcode === p.barcode);
                        return (
                            <div key={idx} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center group active:scale-[0.99] transition-transform relative overflow-hidden">
                                {isFav && <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-amber-100 to-transparent -mr-4 -mt-4 rounded-bl-3xl"></div>}
                                
                                <div className="flex-1 pr-4 z-10">
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
                                <div className="flex flex-col items-end gap-2 z-10">
                                    <div className="text-right">
                                        <div className="text-2xl font-heading font-black text-teal-600 tracking-tight">{p.psf.toFixed(2)} ₺</div>
                                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-0.5">PSF</div>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleFavorite(p); }}
                                        className={`p-2 rounded-full transition-colors ${isFav ? 'bg-amber-100 text-amber-500' : 'bg-slate-50 text-slate-300 hover:text-amber-400'}`}
                                    >
                                        <Star size={18} fill={isFav ? "currentColor" : "none"} />
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