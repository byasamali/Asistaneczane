import React, { useState } from 'react';
import { calculateMfScenario } from '../utils/calculations';
import { Button, InputGroup } from '../components/ui';
import { TrendingUp, AlertTriangle, CheckCircle, Package, ArrowRight } from 'lucide-react';
import { MfAnalysisResult } from '../types';

export const MfView = () => {
    const [dsf, setDsf] = useState('100');
    const [psf, setPsf] = useState('130');
    const [kamu, setKamu] = useState('110');
    const [stock, setStock] = useState('500');
    const [sales, setSales] = useState('50');
    const [inflation, setInflation] = useState('5');
    const [buyDate, setBuyDate] = useState(new Date().toISOString().split('T')[0]);
    const [slider, setSlider] = useState('20');

    const [mfOptions, setMfOptions] = useState([
        { ana: 10, mf: 1 },
        { ana: 20, mf: 3 },
        { ana: 50, mf: 10 },
        { ana: 100, mf: 30 }
    ]);

    const [result, setResult] = useState<MfAnalysisResult | null>(null);

    const handleMfChange = (idx: number, field: 'ana' | 'mf', val: string) => {
        const newOpts = [...mfOptions];
        newOpts[idx] = { ...newOpts[idx], [field]: Number(val) };
        setMfOptions(newOpts);
    };

    const runSimulation = () => {
        const res = calculateMfScenario(
            Number(dsf), Number(psf), Number(kamu), Number(sales), Number(stock), 
            Number(inflation), new Date(buyDate), Number(slider) / 100, mfOptions
        );
        setResult(res);
        // Scroll to results
        setTimeout(() => {
            window.scrollTo({ top: 800, behavior: 'smooth' });
        }, 100);
    };

    return (
        <div className="p-6 pb-24 space-y-8 animate-fade-in text-slate-200">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-indigo-500/10 rounded-2xl"><TrendingUp className="w-7 h-7 text-indigo-400" /></div>
                <div>
                    <h2 className="text-2xl font-heading font-black text-slate-100 tracking-tight">MF Stok Analizi</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Karlılık & Risk Analizi</p>
                </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-4xl shadow-xl border border-slate-800 space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <span className="bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
                    <h3 className="font-heading font-bold text-slate-200">Fiyat ve Mevcut Durum</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <InputGroup label="DSF" value={dsf} onChange={setDsf} />
                    <InputGroup label="PSF" value={psf} onChange={setPsf} />
                    <InputGroup label="Kamu" value={kamu} onChange={setKamu} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <InputGroup label="Aylık Satış" value={sales} onChange={setSales} />
                    <InputGroup label="Mevcut Stok" value={stock} onChange={setStock} />
                    <InputGroup label="Enflasyon %" value={inflation} onChange={setInflation} />
                </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-4xl shadow-xl border border-slate-800 space-y-6">
                 <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <span className="bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
                    <h3 className="font-heading font-bold text-slate-200">Alım Koşulları</h3>
                </div>
                <InputGroup label="Fatura Tarihi" type="date" value={buyDate} onChange={setBuyDate} />
                <div className="bg-slate-950/50 p-5 rounded-3xl border border-slate-800">
                    <div className="flex justify-between items-center mb-3 px-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nakit Satış Payı</label>
                        <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-lg text-xs font-bold">%{slider}</span>
                    </div>
                    <input 
                        type="range" min="0" max="100" value={slider} 
                        onChange={(e) => setSlider(e.target.value)} 
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex justify-between text-[9px] font-black text-slate-600 mt-2 px-1">
                        <span>FULL SGK</span>
                        <span>FULL NAKİT</span>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-4xl shadow-xl border border-slate-800 space-y-6">
                 <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <span className="bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">3</span>
                    <h3 className="font-heading font-bold text-slate-200">MF Teklifleri</h3>
                </div>
                <div className="space-y-3">
                    {mfOptions.map((opt, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-slate-800/30 rounded-2xl border border-slate-800">
                            <span className="text-[10px] font-black text-slate-600 w-4 ml-2">{i+1}</span>
                            <div className="flex-1">
                                <input type="number" value={opt.ana} onChange={(e) => handleMfChange(i, 'ana', e.target.value)} className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700 text-center font-bold text-white focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="Ana" />
                            </div>
                            <span className="text-slate-600 font-black">+</span>
                            <div className="flex-1">
                                <input type="number" value={opt.mf} onChange={(e) => handleMfChange(i, 'mf', e.target.value)} className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700 text-center font-bold text-white focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="MF" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Button onClick={runSimulation} className="bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-950/40 py-5">
                ANALİZİ BAŞLAT
            </Button>

            {/* Results */}
            {result && (
                <div className="space-y-6 pt-4">
                    {result.warning_mode && (
                        <div className="bg-rose-950/20 border border-rose-900/30 p-6 rounded-4xl flex gap-4 items-start shadow-sm">
                            <div className="bg-rose-600 p-2 rounded-xl text-white">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <h4 className="font-heading font-bold text-rose-400">Dikkat: Stok Fazlası Riski!</h4>
                                <p className="text-sm text-slate-400 leading-relaxed font-medium mt-1">Mevcut stok seviyeniz ({result.old_stock}) çok yüksek. Yeni alım yapıldığında malın satış sırası yaklaşık {result.months_delay.toFixed(1)} ay sonra gelecektir. Enflasyon etkisi karlılığı negatif etkileyebilir.</p>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex items-center gap-2 justify-center text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900 w-fit mx-auto px-4 py-2 rounded-full border border-slate-800 shadow-sm">
                        Tahmini Satış Başlangıcı: <b className="text-slate-300 ml-1">{result.months_delay.toFixed(1)} Ay Sonra</b>
                    </div>

                    <div className="space-y-5">
                        {result.options.map((opt) => (
                            <div key={opt.id} className={`relative p-7 rounded-4xl border-2 transition-all ${opt.is_recommended ? (result.warning_mode ? 'border-rose-800/50 bg-slate-900 shadow-xl' : 'border-teal-500 bg-teal-500/5 shadow-2xl shadow-teal-950/50 transform scale-[1.02]') : 'border-slate-800 bg-slate-900/60 opacity-80'}`}>
                                {opt.is_recommended && (
                                    <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[10px] font-black text-white flex items-center gap-1.5 shadow-lg ${result.warning_mode ? 'bg-rose-600' : 'bg-teal-600'}`}>
                                        {result.warning_mode ? <AlertTriangle size={12}/> : <CheckCircle size={12}/>}
                                        {result.warning_mode ? 'MİNİMUM ZARAR' : 'EN KARLI SEÇENEK'}
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="font-heading font-extrabold text-xl text-slate-100">{opt.ana} + {opt.mf} Teklifi</h4>
                                    <div className="bg-slate-800 px-3 py-1 rounded-xl text-[10px] font-black text-slate-500 uppercase">Birim: <span className="text-slate-300">{opt.unit_cost.toFixed(2)}₺</span></div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-slate-950/50 p-4 rounded-3xl border border-slate-800">
                                        <div className="text-slate-600 text-[9px] font-black uppercase tracking-widest mb-1">Finansal Kazanç</div>
                                        <div className="font-heading font-extrabold text-teal-400 text-lg">+{opt.psf_gain.toFixed(0)} ₺</div>
                                    </div>
                                    <div className="bg-slate-950/50 p-4 rounded-3xl border border-slate-800">
                                        <div className="text-slate-600 text-[9px] font-black uppercase tracking-widest mb-1">Stok Yükü</div>
                                        <div className="font-heading font-extrabold text-rose-500 text-lg">-{opt.sgk_cost.toFixed(0)} ₺</div>
                                    </div>
                                </div>
                                
                                <div className="flex items-end justify-between border-t border-slate-800 pt-5">
                                    <div>
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Kutu Başı Net Kar</div>
                                        <div className={`text-3xl font-heading font-black leading-none ${opt.real_profit_total < 0 ? 'text-rose-500' : 'text-slate-100'}`}>
                                            {opt.per_box_profit_tl.toFixed(2)} ₺
                                        </div>
                                    </div>
                                    <div className={`flex flex-col items-end`}>
                                        <span className={`text-xl font-heading font-black ${opt.per_box_profit_pct < 0 ? 'text-rose-500' : 'text-teal-400'}`}>
                                            %{opt.per_box_profit_pct.toFixed(1)}
                                        </span>
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Kar Oranı</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};