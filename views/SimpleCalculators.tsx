import React, { useState } from 'react';
import { calculateAlcoholDilution, calculateBMI, calculateBSA, calculateCorrectedCalcium } from '../utils/calculations';
import { Button, InputGroup, ResultBox } from '../components/ui';
import { Calculator, FlaskConical, Activity, Droplets } from 'lucide-react';

export const BmiView = () => {
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [result, setResult] = useState<any>(null);

    const handleCalc = () => {
        setResult(calculateBMI(Number(height), Number(weight)));
    };

    return (
        <div className="p-4">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-teal-500/10 rounded-lg"><Activity className="w-6 h-6 text-teal-400" /></div>
                <h2 className="text-xl font-bold text-slate-100">VKİ Hesapla</h2>
            </div>
            <InputGroup label="Boy (cm)" value={height} onChange={setHeight} placeholder="175" />
            <InputGroup label="Kilo (kg)" value={weight} onChange={setWeight} placeholder="70" />
            <Button onClick={handleCalc}>Hesapla</Button>
            {result && result.success && (
                <ResultBox 
                    title="Vücut Kitle İndeksi" 
                    value={`${result.value?.toFixed(2)}`} 
                    subtext={result.category} 
                    colorClass={result.color.replace('text-', 'text-')} 
                />
            )}
            {result && !result.success && <div className="mt-4 text-rose-400 text-center font-bold">{result.message}</div>}
        </div>
    );
};

export const BsaView = () => {
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [result, setResult] = useState<any>(null);

    const handleCalc = () => {
        setResult(calculateBSA(Number(height), Number(weight)));
    };

    return (
        <div className="p-4">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-purple-500/10 rounded-lg"><Calculator className="w-6 h-6 text-purple-400" /></div>
                <h2 className="text-xl font-bold text-slate-100">BSA (Mosteller)</h2>
            </div>
            <InputGroup label="Boy (cm)" value={height} onChange={setHeight} placeholder="175" />
            <InputGroup label="Kilo (kg)" value={weight} onChange={setWeight} placeholder="70" />
            <Button onClick={handleCalc}>Hesapla</Button>
            {result && result.success && (
                <ResultBox title="Vücut Yüzey Alanı" value={`${result.value?.toFixed(3)} m²`} />
            )}
        </div>
    );
};

export const CalciumView = () => {
    const [ca, setCa] = useState('');
    const [alb, setAlb] = useState('');
    const [result, setResult] = useState<any>(null);

    const handleCalc = () => {
        setResult(calculateCorrectedCalcium(Number(ca), Number(alb)));
    };

    return (
        <div className="p-4">
             <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-lg"><Droplets className="w-6 h-6 text-blue-400" /></div>
                <h2 className="text-xl font-bold text-slate-100">Düzeltilmiş Kalsiyum</h2>
            </div>
            <InputGroup label="Ölçülen Kalsiyum (mg/dL)" value={ca} onChange={setCa} placeholder="8.5" />
            <InputGroup label="Serum Albümin (g/dL)" value={alb} onChange={setAlb} placeholder="4.0" />
            <Button onClick={handleCalc}>Hesapla</Button>
            {result && result.success && (
                <ResultBox 
                    title="Düzeltilmiş Değer" 
                    value={`${result.value?.toFixed(2)} mg/dL`} 
                    subtext={result.category}
                    colorClass={result.color}
                />
            )}
        </div>
    );
};

export const AlcoholView = () => {
    const [targetDegree, setTargetDegree] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [currentDegree, setCurrentDegree] = useState('96');
    const [result, setResult] = useState<any>(null);

    const handleCalc = () => {
        setResult(calculateAlcoholDilution(Number(targetDegree), Number(targetAmount), Number(currentDegree)));
    };

    return (
        <div className="p-4">
             <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-amber-500/10 rounded-lg"><FlaskConical className="w-6 h-6 text-amber-400" /></div>
                <h2 className="text-xl font-bold text-slate-100">Alkol Seyreltme</h2>
            </div>
            <InputGroup label="İstenen Derece (%)" value={targetDegree} onChange={setTargetDegree} placeholder="70" />
            <InputGroup label="İstenen Miktar (ml)" value={targetAmount} onChange={setTargetAmount} placeholder="1000" />
            <InputGroup label="Eldeki Alkol Derecesi (%)" value={currentDegree} onChange={setCurrentDegree} />
            <Button onClick={handleCalc}>Hesapla</Button>
            {result && result.success && (
                <div className="mt-6 p-5 bg-amber-950/20 rounded-3xl border border-amber-900/30">
                    <h3 className="font-bold text-amber-500 mb-3 flex items-center gap-2">
                        <FlaskConical size={18} /> Hazırlama Reçetesi
                    </h3>
                    <ul className="space-y-3 text-slate-300">
                        <li className="flex justify-between items-center">
                            <span className="text-sm">Kullanılacak Alkol:</span>
                            <span className="font-mono font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl">{result.details.neededStrong} ml</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <span className="text-sm">Eklenecek Su:</span>
                            <span className="font-mono font-black text-teal-400 bg-teal-500/10 px-3 py-1 rounded-xl">{result.details.neededDiluent} ml</span>
                        </li>
                        <li className="flex justify-between pt-1 font-bold">
                            <span className="text-slate-400 uppercase text-[10px] tracking-widest">Toplam Hacim:</span>
                            <span className="text-slate-100">{targetAmount} ml</span>
                        </li>
                    </ul>
                </div>
            )}
             {result && !result.success && <div className="mt-4 text-rose-400 text-center font-bold">{result.message}</div>}
        </div>
    );
};