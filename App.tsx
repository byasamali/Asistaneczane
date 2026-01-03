import React, { useState } from 'react';
import { BmiView, BsaView, CalciumView, AlcoholView } from './views/SimpleCalculators';
import { WhoView } from './views/WhoCalculator';
import { MfView } from './views/MfCalculator';
import { PsfView } from './views/PsfView';
import { LayoutGrid, Calculator, Baby, TrendingUp, FlaskConical, Droplets, Activity, Tag, Smartphone, User, MessageCircle, Home, Info, HeartPulse, ChevronRight, Search, ScanBarcode } from 'lucide-react';

enum Tab {
  Home = 'home',
  Calculators = 'calcs',
  Stock = 'stock',
  Info = 'info'
}

enum Tool {
  BMI = 'bmi',
  BSA = 'bsa',
  Calcium = 'calc',
  Alcohol = 'alc',
  WHO = 'who',
  MF = 'mf',
  PSF = 'psf'
}

const App = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Home);
  const [activeTool, setActiveTool] = useState<Tool | null>(null);

  const renderBody = () => {
    if (activeTool) {
        return (
            <div className="animate-fade-in bg-[#0f172a] min-h-screen">
                <div className="flex items-center p-4 glass border-b border-slate-800 sticky top-0 z-50">
                    <button 
                        onClick={() => setActiveTool(null)}
                        className="p-2 -ml-2 text-teal-400 font-bold flex items-center gap-1 active:scale-95 transition-all"
                    >
                        <LayoutGrid size={18} /> Geri
                    </button>
                    <div className="flex-1 text-center font-heading font-bold text-slate-100 pr-8">
                        {activeTool === Tool.MF ? 'MF Analizi' : activeTool === Tool.PSF ? 'Fiyat Gör' : 'Hesapla'}
                    </div>
                </div>
                <div className="max-w-md mx-auto h-full text-slate-200">
                    {activeTool === Tool.BMI && <BmiView />}
                    {activeTool === Tool.BSA && <BsaView />}
                    {activeTool === Tool.Calcium && <CalciumView />}
                    {activeTool === Tool.Alcohol && <AlcoholView />}
                    {activeTool === Tool.WHO && <WhoView />}
                    {activeTool === Tool.MF && <MfView />}
                    {activeTool === Tool.PSF && <PsfView />}
                </div>
            </div>
        );
    }

    switch (activeTab) {
      case Tab.Calculators: return <CalculatorList onSelect={setActiveTool} />;
      case Tab.Stock: return <MfView />;
      case Tab.Info: return <DeveloperInfo />;
      default: return <HomeDashboard onSelect={setActiveTool} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col max-w-md mx-auto relative overflow-x-hidden font-sans text-slate-100">
      {/* Header */}
      {!activeTool && (
        <header className="bg-[#0f172a]/90 backdrop-blur-md px-6 py-5 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
            <div className="flex items-center gap-2.5">
                <div className="bg-teal-600 p-2 rounded-2xl text-white shadow-lg shadow-teal-900/20">
                    <HeartPulse size={22} />
                </div>
                <div>
                    <h1 className="font-heading font-extrabold text-lg text-slate-100 leading-none">Eczacı Asistanı</h1>
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Klinik & Finans</span>
                </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                <User size={20} className="text-slate-500" />
            </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 overflow-y-auto ${!activeTool ? 'pb-24' : ''}`}>
        {renderBody()}
      </main>

      {/* Bottom Navigation */}
      {!activeTool && (
        <nav className="fixed bottom-0 left-0 right-0 glass border-t border-slate-800 px-8 py-4 flex justify-between items-center z-50 max-w-md mx-auto rounded-t-[2.5rem]">
            <NavButton active={activeTab === Tab.Home} onClick={() => setActiveTab(Tab.Home)} icon={<Home size={22} />} label="Ev" />
            <NavButton active={activeTab === Tab.Calculators} onClick={() => setActiveTab(Tab.Calculators)} icon={<Calculator size={22} />} label="Klinik" />
            <NavButton active={activeTab === Tab.Stock} onClick={() => setActiveTab(Tab.Stock)} icon={<TrendingUp size={22} />} label="Analiz" />
            <NavButton active={activeTab === Tab.Info} onClick={() => setActiveTab(Tab.Info)} icon={<Info size={22} />} label="İmza" />
        </nav>
      )}
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center gap-1.5 transition-all relative ${active ? 'text-teal-400' : 'text-slate-500'}`}
    >
        <div className={`p-1 rounded-xl transition-all ${active ? 'bg-teal-500/10 shadow-sm' : ''}`}>
            {icon}
        </div>
        <span className={`text-[9px] font-black uppercase tracking-tighter ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
        {active && <div className="absolute -bottom-1 w-1 h-1 bg-teal-400 rounded-full"></div>}
    </button>
);

const HomeDashboard = ({ onSelect, setActiveTab }: { onSelect: (t: Tool) => void, setActiveTab: (t: Tab) => void }) => {
    const pratiketWhatsapp = "https://wa.me/905523624027?text=Merhaba,%20Pratiket%20etiket%20programı%20hakkında%20bilgi%20almak%20istiyorum.";
    
    return (
        <div className="p-6 animate-fade-in space-y-8">
            
            {/* Pratiket Ad section */}
            <div 
                onClick={() => window.open(pratiketWhatsapp, '_blank')}
                className="bg-gradient-to-br from-orange-600 to-rose-600 rounded-4xl p-7 text-white shadow-2xl shadow-orange-950/20 relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer border border-white/10"
            >
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-xl">
                            <Tag size={16} className="text-white" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-50">ÖZEL ÇÖZÜM</span>
                    </div>
                    <h2 className="text-4xl font-heading font-black mb-1 leading-none tracking-tight">PRATİKET</h2>
                    <p className="text-orange-50 text-sm font-semibold opacity-90 mb-4 leading-snug">
                        Pratik ilaç tarif etiket programı.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mb-5">
                         <div className="inline-block bg-white text-orange-700 px-3 py-1.5 rounded-xl text-xs font-black shadow-lg shadow-orange-950/20">
                            1.500 ₺ / YIL
                        </div>
                        <div className="inline-block bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black animate-blink border border-white/10">
                            15 GÜN ÜCRETSİZ DEMO
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="bg-white text-orange-700 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 w-fit">
                            <MessageCircle size={16} /> WHATSAPP İLE SOR
                        </div>
                        <div className="text-[11px] font-bold text-white/80 flex items-center gap-1.5">
                            <Smartphone size={13} /> 0552 362 40 27 — Ecz. Burak YAŞAMALI
                        </div>
                    </div>
                </div>
                <Smartphone className="absolute -bottom-10 -right-10 text-white/10 rotate-12" size={200} />
            </div>

            <section>
                <div className="flex justify-between items-end mb-5 px-1">
                    <h3 className="text-slate-100 text-lg font-heading font-extrabold tracking-tight">Favori Araçlar</h3>
                    <button onClick={() => setActiveTab(Tab.Calculators)} className="text-teal-400 text-xs font-black uppercase tracking-widest">Tümü</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <ToolCard icon={<Baby size={28} className="text-rose-400" />} title="WHO Z-Skor" color="bg-rose-500/10" onClick={() => onSelect(Tool.WHO)} />
                    <ToolCard icon={<ScanBarcode size={28} className="text-indigo-400" />} title="Fiyat Gör" color="bg-indigo-500/10" onClick={() => onSelect(Tool.PSF)} />
                </div>
            </section>

            <section>
                 <h3 className="text-slate-100 text-lg font-heading font-extrabold tracking-tight mb-5 px-1">En Çok Kullanılanlar</h3>
                 <div className="space-y-4">
                    <ToolRow icon={<Activity className="text-emerald-400" />} title="Vücut Kitle İndeksi" desc="Boy/Kilo Analizi" onClick={() => onSelect(Tool.BMI)} />
                    <ToolRow icon={<TrendingUp className="text-teal-400" />} title="MF Stok Analizi" desc="Finansal Karlılık Analizi" onClick={() => onSelect(Tool.MF)} />
                 </div>
            </section>
        </div>
    );
};

const CalculatorList = ({ onSelect }: { onSelect: (t: Tool) => void }) => (
    <div className="p-6 animate-fade-in">
        <h2 className="text-2xl font-heading font-black text-slate-100 mb-8 tracking-tight">Klinik Hesaplar</h2>
        
        <div className="mb-10">
            <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] mb-5 ml-1">Klinik Ölçümler</h3>
            <div className="space-y-4">
                <ToolRow icon={<Baby className="text-rose-400" />} title="WHO Z-Skoru" desc="Gelişim Takibi (0-19 Yaş)" onClick={() => onSelect(Tool.WHO)} />
                <ToolRow icon={<Activity className="text-emerald-400" />} title="VKİ Hesapla" desc="Sağlık Durumu Analizi" onClick={() => onSelect(Tool.BMI)} />
                <ToolRow icon={<Calculator className="text-indigo-400" />} title="Vücut Yüzey Alanı" desc="BSA (Mosteller Formülü)" onClick={() => onSelect(Tool.BSA)} />
                <ToolRow icon={<Droplets className="text-blue-400" />} title="Düzeltilmiş Kalsiyum" desc="Albümin Düzeltme Hesabı" onClick={() => onSelect(Tool.Calcium)} />
            </div>
        </div>

        <div>
            <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] mb-5 ml-1">Eczane & Laboratuvar</h3>
            <div className="space-y-4">
                <ToolRow icon={<ScanBarcode className="text-purple-400" />} title="Fiyat Gör (PSF)" desc="Google Sheet Veri Tabanı" onClick={() => onSelect(Tool.PSF)} />
                <ToolRow icon={<FlaskConical className="text-amber-400" />} title="Alkol Seyreltme" desc="Etanol Hazırlama Hesabı" onClick={() => onSelect(Tool.Alcohol)} />
                <ToolRow icon={<TrendingUp className="text-teal-400" />} title="MF Stok Analizi" desc="Finansal Karlılık Analizi" onClick={() => onSelect(Tool.MF)} />
            </div>
        </div>
    </div>
);

const ToolCard = ({ icon, title, onClick, color }: { icon: React.ReactNode, title: string, onClick: () => void, color: string }) => (
    <button onClick={onClick} className="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl border border-slate-800 flex flex-col items-center gap-4 active:scale-95 active:shadow-inner transition-all text-center group">
        <div className={`p-4 ${color} rounded-3xl group-active:scale-110 transition-transform shadow-sm`}>{icon}</div>
        <span className="font-heading font-bold text-slate-200 text-sm tracking-tight">{title}</span>
    </button>
);

const ToolRow = ({ icon, title, desc, onClick }: { icon: React.ReactNode, title: string, desc: string, onClick: () => void }) => (
    <button onClick={onClick} className="w-full bg-slate-900 p-5 rounded-3xl shadow-xl border border-slate-800 flex items-center gap-5 active:bg-slate-800 active:scale-[0.98] transition-all text-left group">
        <div className="p-4 bg-slate-800 rounded-2xl group-active:bg-slate-900 transition-colors border border-slate-700">{icon}</div>
        <div className="flex-1">
            <div className="font-heading font-bold text-slate-100 tracking-tight leading-tight">{title}</div>
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">{desc}</div>
        </div>
        <div className="text-slate-600 group-hover:text-teal-400 transition-colors">
            <ChevronRight size={22} />
        </div>
    </button>
);

const DeveloperInfo = () => {
    const whatsappLink = "https://wa.me/905523624027";
    return (
        <div className="p-8 text-center animate-fade-in space-y-8">
            <div className="relative inline-block">
                <div className="w-28 h-28 bg-slate-800 rounded-4xl flex items-center justify-center mx-auto shadow-inner border-4 border-slate-900">
                    <User size={56} className="text-teal-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-slate-900"></div>
            </div>
            
            <div>
                <h2 className="text-3xl font-heading font-black text-slate-100 tracking-tight">Ecz. Burak YAŞAMALI</h2>
                <p className="text-teal-400 font-black mt-1 uppercase text-[10px] tracking-[0.3em]">Software & Pharmacy</p>
            </div>
            
            <div className="bg-slate-900 p-7 rounded-4xl shadow-xl border border-slate-800 text-left">
                <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium italic">
                    "Eczacılık pratiğini teknoloji ile birleştirerek daha verimli çalışma alanları oluşturmayı hedefliyorum."
                </p>
                <a 
                    href={`${whatsappLink}?text=Merhaba,%20Eczacı%20Asistanı%20hakkında%20bilgi%20almak%20istiyorum.`}
                    target="_blank"
                    className="flex items-center justify-center gap-3 bg-teal-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-teal-900/30 hover:bg-teal-700 active:scale-95 transition-all text-sm uppercase tracking-widest"
                >
                    <MessageCircle size={20} /> WHATSAPP DESTEK
                </a>
            </div>

            <div 
                onClick={() => window.open(`https://wa.me/905523624027?text=Merhaba, Pratiket etiket programı hakkında bilgi almak istiyorum.`, '_blank')}
                className="bg-orange-950/20 border border-orange-900/20 p-7 rounded-4xl text-left relative overflow-hidden shadow-sm cursor-pointer active:scale-[0.99] transition-all"
            >
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <Tag size={16} className="text-orange-500" />
                        <h4 className="font-black text-orange-400 uppercase tracking-[0.2em] text-[10px]">TAVSİYE EDİLEN</h4>
                    </div>
                    <h5 className="font-heading font-black text-slate-100 text-xl mb-1 tracking-tight">Pratiket Etiket Sistemi</h5>
                    <p className="text-xs text-slate-400 font-bold leading-relaxed mb-6">
                        Eczaneniz için profesyonel etiketleme ve bilgilendirme çözümü.
                    </p>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                           <div className="text-orange-500 font-heading font-black text-2xl tracking-tighter">1.500 ₺ <span className="text-[10px] text-orange-800">/ YIL</span></div>
                        </div>
                        <button className="bg-orange-600 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-950/20 active:scale-95 transition-all">
                            İNCELE
                        </button>
                    </div>
                </div>
                <Smartphone className="absolute -bottom-6 -right-6 text-orange-200 opacity-5" size={140} />
            </div>
        </div>
    );
};

export default App;