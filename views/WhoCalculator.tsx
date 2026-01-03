import React, { useState } from 'react';
import { calculateWhoZScore } from '../utils/calculations';
import { Button, InputGroup, ResultBox } from '../components/ui';
import { Gender } from '../types';
import { Baby } from 'lucide-react';

export const WhoView = () => {
    const [birthDate, setBirthDate] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [gender, setGender] = useState<Gender>(Gender.Male);
    const [result, setResult] = useState<any>(null);

    const handleCalc = () => {
        if (!birthDate) return;
        const res = calculateWhoZScore(
            new Date(birthDate),
            new Date(),
            gender,
            Number(weight),
            height ? Number(height) : null
        );
        setResult(res);
    };

    return (
        <div className="p-4">
             <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-pink-500/10 rounded-lg"><Baby className="w-6 h-6 text-pink-400" /></div>
                <h2 className="text-xl font-bold text-slate-100">WHO Z-Skoru (0-19 Yaş)</h2>
            </div>
            
            <div className="mb-6">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Cinsiyet</label>
                <div className="flex bg-slate-800 p-1 rounded-2xl border border-slate-700">
                    <button 
                        onClick={() => setGender(Gender.Male)}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${gender === Gender.Male ? 'bg-slate-700 shadow-lg text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Erkek
                    </button>
                    <button 
                        onClick={() => setGender(Gender.Female)}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${gender === Gender.Female ? 'bg-slate-700 shadow-lg text-pink-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Kız
                    </button>
                </div>
            </div>

            <InputGroup label="Doğum Tarihi" type="date" value={birthDate} onChange={setBirthDate} />
            <InputGroup label="Kilo (kg)" value={weight} onChange={setWeight} placeholder="Örn: 15" />
            <InputGroup label="Boy (cm) - 5 yaş üstü için zorunlu" value={height} onChange={setHeight} placeholder="Örn: 100" />
            
            <Button onClick={handleCalc}>Hesapla</Button>
            
            {result && !result.error && (
                <div className="mt-6 space-y-4 animate-fade-in">
                     <ResultBox 
                        title="Z-Skoru" 
                        value={`${result.z_score?.toFixed(2).replace('.', ',')} SD`} 
                        subtext={`${result.age_months.toFixed(1)} Aylık - ${result.type}`}
                        colorClass={Math.abs(result.z_score || 0) > 2 ? 'text-rose-400' : 'text-teal-400'}
                    />
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center bg-slate-800/30 py-2 rounded-xl">
                        Ölçüm Değeri: <span className="text-slate-300">{result.measurement_value}</span>
                    </div>
                </div>
            )}
            
            {result && result.error && (
                <div className="mt-4 p-4 bg-rose-950/20 text-rose-400 rounded-2xl text-center border border-rose-900/20 font-bold">
                    {result.error}
                </div>
            )}
        </div>
    );
};