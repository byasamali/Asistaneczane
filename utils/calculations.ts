import { CalculationResult, Gender, MfAnalysisResult, MfOption, WhoResult } from "../types";
import { boys_bmi_61_228_months, boys_weight_0_5, girls_bmi_61_228_months, girls_weight_0_5 } from "./whoData";

/**
 * Calculates BMI (Vücut Kitle İndeksi)
 */
export function calculateBMI(heightCm: number, weightKg: number): CalculationResult {
  if (heightCm <= 0 || weightKg <= 0) {
    return { success: false, message: "Boy ve kilo pozitif değer olmalıdır." };
  }

  const heightM = heightCm / 100.0;
  const bmi = weightKg / (heightM * heightM);

  let category = "";
  let color = "#000000";

  if (bmi < 18.5) { category = "Zayıf"; color = "text-blue-600"; }
  else if (bmi < 25) { category = "Normal kilolu"; color = "text-green-600"; }
  else if (bmi < 30) { category = "Fazla kilolu"; color = "text-orange-600"; }
  else if (bmi < 35) { category = "1. Derece Obez"; color = "text-red-600"; }
  else if (bmi < 40) { category = "2. Derece Obez"; color = "text-red-700"; }
  else { category = "3. Derece (Morbid) Obez"; color = "text-red-900"; }

  return {
    success: true,
    message: `Sonuç: ${bmi.toFixed(2)} kg/m²`,
    value: bmi,
    category,
    color
  };
}

/**
 * Calculates BSA (Vücut Yüzey Alanı - Mosteller)
 */
export function calculateBSA(heightCm: number, weightKg: number): CalculationResult {
  if (heightCm <= 0 || weightKg <= 0) {
    return { success: false, message: "Boy ve kilo pozitif değer olmalıdır." };
  }
  const bsa = Math.sqrt((heightCm * weightKg) / 3600);
  return {
    success: true,
    message: `Vücut Yüzey Alanı (BSA): ${bsa.toFixed(3)} m²`,
    value: bsa
  };
}

/**
 * Calculates Corrected Calcium (Düzeltilmiş Kalsiyum - Payne)
 */
export function calculateCorrectedCalcium(calcium: number, albumin: number): CalculationResult {
  if (calcium <= 0 || albumin <= 0) {
    return { success: false, message: "Değerler pozitif olmalıdır." };
  }
  const corrected = calcium + (0.8 * (4.0 - albumin));
  
  let category = "";
  let color = "";
  if (corrected < 8.5) { category = "Düşük (Hipokalsemi Riski)"; color = "text-blue-600"; }
  else if (corrected <= 10.2) { category = "Normal"; color = "text-green-600"; }
  else { category = "Yüksek (Hiperkalsemi Riski)"; color = "text-red-600"; }

  return {
    success: true,
    message: `Düzeltilmiş Kalsiyum: ${corrected.toFixed(2)} mg/dL`,
    value: corrected,
    category,
    color
  };
}

/**
 * Calculates Alcohol Dilution
 */
export function calculateAlcoholDilution(targetDegree: number, targetAmount: number, currentDegree: number): CalculationResult {
  if (targetDegree <= 0 || targetAmount <= 0 || currentDegree <= 0) {
    return { success: false, message: "Değerler pozitif olmalıdır." };
  }
  if (targetDegree >= currentDegree) {
    return { success: false, message: "Hedef derece, mevcut dereceden düşük olmalıdır." };
  }

  const partStrong = targetDegree;
  const partDiluent = currentDegree - targetDegree;
  const totalParts = currentDegree;

  const neededStrong = (targetAmount * partStrong) / totalParts;
  const neededDiluent = (targetAmount * partDiluent) / totalParts;

  return {
    success: true,
    message: "Hesaplama Başarılı",
    details: {
      neededStrong: neededStrong.toFixed(2),
      neededDiluent: neededDiluent.toFixed(2)
    }
  };
}

/**
 * WHO Z-Score Helpers
 */
function calculateAgeInMonths(birthdate: Date, refdate: Date): number {
  const diffTime = Math.abs(refdate.getTime() - birthdate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  // WHO standard: 1 month = 30.4375 days
  return diffDays / 30.4375;
}

function calculateZScoreValue(measurement: number, L: number, M: number, S: number): number {
  if (L === 0) {
    return Math.log(measurement / M) / S;
  }
  return (Math.pow(measurement / M, L) - 1) / (L * S);
}

export function calculateWhoZScore(
  birthDate: Date,
  refDate: Date,
  gender: Gender,
  weight: number,
  height: number | null
): WhoResult {
  const ageMonths = calculateAgeInMonths(birthDate, refDate);
  const genderKey = gender === Gender.Male ? 'erkek' : 'kiz';
  
  let dataDict: Record<number, [number, number, number]> | null = null;
  let type = "";
  let measurement = 0;
  let measurementStr = "";

  if (ageMonths >= 0 && ageMonths <= 60) {
    dataDict = genderKey === 'erkek' ? boys_weight_0_5 : girls_weight_0_5;
    type = "kilo_yas";
    measurement = weight;
    measurementStr = `${weight.toFixed(2)} kg`;
  } else if (ageMonths > 60 && ageMonths <= 228) {
    dataDict = genderKey === 'erkek' ? boys_bmi_61_228_months : girls_bmi_61_228_months;
    type = "bmi_yas";
    if (!height) return { age_months: ageMonths, type: 'error', z_score: null, measurement_value: '', lms: null, error: "BMI için boy gereklidir." };
    const heightM = height / 100.0;
    measurement = weight / (heightM * heightM);
    measurementStr = `${measurement.toFixed(2)} kg/m²`;
  } else {
    return { age_months: ageMonths, type: 'error', z_score: null, measurement_value: '', lms: null, error: "Yaş aralığı dışı (0-19 yaş)." };
  }

  const lowerMonth = Math.floor(ageMonths);
  const upperMonth = Math.ceil(ageMonths);

  const lmsLow = dataDict[lowerMonth];
  const lmsHigh = dataDict[upperMonth] || lmsLow;

  if (!lmsLow) {
    return { age_months: ageMonths, type, z_score: null, measurement_value: measurementStr, lms: null, error: "Veri bulunamadı." };
  }

  const fraction = ageMonths - lowerMonth;
  const L = lmsLow[0] + (lmsHigh[0] - lmsLow[0]) * fraction;
  const M = lmsLow[1] + (lmsHigh[1] - lmsLow[1]) * fraction;
  const S = lmsLow[2] + (lmsHigh[2] - lmsLow[2]) * fraction;

  const z = calculateZScoreValue(measurement, L, M, S);

  return {
    z_score: z,
    age_months: ageMonths,
    type: type === 'kilo_yas' ? 'Kilo/Yaş' : 'VKİ/Yaş',
    measurement_value: measurementStr,
    lms: [L, M, S]
  };
}

/**
 * MF Simulation Logic
 */
export function calculateMfScenario(
  dsf: number,
  psf: number,
  kamu: number,
  monthlySales: number,
  stock: number,
  inflationPercent: number,
  buyDate: Date,
  psfRatio: number, // 0 to 1
  mfOptions: {ana: number, mf: number}[]
): MfAnalysisResult {
    const monthlyInfRate = inflationPercent / 100.0;
    const pDate = new Date(buyDate);
    
    // Payment date logic: Month + 3, day 15
    const paymentDate = new Date(pDate);
    paymentDate.setMonth(paymentDate.getMonth() + 3);
    paymentDate.setDate(15);

    const sgkRatio = 1.0 - psfRatio;
    const results: MfOption[] = [];

    mfOptions.forEach((opt, idx) => {
        if (opt.ana === 0) return;

        const newBatchTotal = opt.ana + opt.mf;
        const invoiceCost = opt.ana * dsf;
        const unitCost = invoiceCost / newBatchTotal;

        let virtualOldStock = stock;
        let virtualNewStock = newBatchTotal;
        
        let simDate = new Date(pDate);
        
        let totalPsfFinanceGain = 0.0;
        let totalSgkStockCost = 0.0;
        let salesRevenuePsf = 0.0;
        let salesRevenueSgk = 0.0;
        
        let monthCounter = 0;

        while (virtualNewStock > 0 && monthCounter < 1200) {
            let salesCapacity = 0;
            // First month partial? Python code logic says check day of month. 
            // Simplifying for JS: check if first iteration
            if (monthCounter === 0) {
                const daysInMonth = 30; // Approx
                const daysRemaining = Math.max(0, 30 - simDate.getDate());
                salesCapacity = monthlySales * (daysRemaining / 30.0);
                // Move sim date to '28th' for calc reference logic in python
                simDate.setDate(28); 
            } else {
                salesCapacity = monthlySales;
                simDate.setDate(15);
            }

            const salesThisMonth = Math.min(salesCapacity, virtualOldStock + virtualNewStock);
            const soldFromOld = Math.min(salesThisMonth, virtualOldStock);
            const soldFromNew = salesThisMonth - soldFromOld;

            virtualOldStock -= soldFromOld;
            virtualNewStock -= soldFromNew;

            if (salesThisMonth < 0.01 && virtualNewStock < 0.01) break;

            const salesPsf = soldFromNew * psfRatio;
            const salesSgk = soldFromNew * sgkRatio;

            salesRevenuePsf += salesPsf * psf;
            salesRevenueSgk += salesSgk * kamu;

            // Finance Gain Logic
            const timeDiff = paymentDate.getTime() - simDate.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            if (daysDiff > 0 && soldFromNew > 0) {
                const dailyInterest = monthlyInfRate / 30.0;
                const financeGain = (salesPsf * unitCost) * dailyInterest * daysDiff;
                totalPsfFinanceGain += financeGain;
            }

            // Stock Cost Logic (Carrying Cost)
            if (virtualNewStock > 0) {
                const costOfCarry = virtualNewStock * unitCost * monthlyInfRate;
                totalSgkStockCost += costOfCarry;
            }

            // Increment Month
            simDate.setMonth(simDate.getMonth() + 1);
            monthCounter++;
        }

        const nominalGrossProfit = (salesRevenuePsf + salesRevenueSgk) - invoiceCost;
        const netFinanceEffect = totalPsfFinanceGain - totalSgkStockCost;
        const realTotalProfit = nominalGrossProfit + netFinanceEffect;
        
        const perBoxRealProfit = realTotalProfit / newBatchTotal;
        const perBoxRealMargin = unitCost > 0 ? (perBoxRealProfit / unitCost) * 100 : 0;

        results.push({
            id: idx + 1,
            ana: opt.ana,
            mf: opt.mf,
            total: newBatchTotal,
            unit_cost: unitCost,
            months: monthCounter,
            psf_gain: totalPsfFinanceGain,
            sgk_cost: totalSgkStockCost,
            net_finance: netFinanceEffect,
            real_profit_total: realTotalProfit,
            per_box_profit_tl: perBoxRealProfit,
            per_box_profit_pct: perBoxRealMargin
        });
    });

    // Determine recommendation
    let warningMode = false;
    let recommended: MfOption | null = null;

    if (results.length > 0) {
        const bestMargin = results.reduce((prev, current) => (prev.per_box_profit_pct > current.per_box_profit_pct) ? prev : current);
        
        if (bestMargin.real_profit_total < -0.01) {
            warningMode = true;
            // Minimize total stock purchased (lowest total)
            recommended = results.reduce((prev, current) => (prev.total < current.total) ? prev : current);
        } else {
            recommended = bestMargin;
        }

        if (recommended) recommended.is_recommended = true;
    }

    return {
        options: results,
        warning_mode: warningMode,
        old_stock: stock,
        months_delay: monthlySales > 0 ? stock / monthlySales : 0,
        buy_date_str: pDate.toLocaleDateString('tr-TR'),
        payment_date_str: paymentDate.toLocaleDateString('tr-TR')
    };
}
