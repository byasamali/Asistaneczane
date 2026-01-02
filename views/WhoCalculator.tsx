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
                <div className="p-2 bg-pink-100 rounded-lg"><Baby className="w-6 h-6 text-pink-600" /></div>
                <h2 className="text-xl font-bold text-slate-800">WHO Z-Skoru (0-19 Yaş)</h2>
            </div>
            
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-600 mb-2">Cinsiyet</label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setGender(Gender.Male)}
                        className={`flex-1 py-2 rounded-md font-medium transition-all ${gender === Gender.Male ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
                    >
                        Erkek
                    </button>
                    <button 
                        onClick={() => setGender(Gender.Female)}
                        className={`flex-1 py-2 rounded-md font-medium transition-all ${gender === Gender.Female ? 'bg-white shadow text-pink-600' : 'text-slate-500'}`}
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
                        value={`${result.z_score?.toFixed(2)}`} 
                        subtext={`${result.age_months.toFixed(1)} Aylık - ${result.type}`}
                        colorClass={Math.abs(result.z_score || 0) > 2 ? 'text-red-600' : 'text-green-600'}
                    />
                    <div className="text-sm text-slate-500 text-center">
                        Ölçüm Değeri: {result.measurement_value}
                    </div>
                </div>
            )}
            
            {result && result.error && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-center border border-red-100">
                    {result.error}
                </div>
            )}
        </div>
    );
};
