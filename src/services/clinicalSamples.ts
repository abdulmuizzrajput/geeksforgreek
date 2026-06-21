export interface HealthDocument {
  id: string;
  title: string;
  type: 'blood_report' | 'doctor_note' | 'general';
  content: string;
  addedAt: string;
  isSample?: boolean;
}

export const CLINICAL_SAMPLES: HealthDocument[] = [
  {
    id: 'sample-cbc-metabolic',
    title: 'Comprehensive CBC & Metabolic Panel',
    type: 'blood_report',
    isSample: true,
    addedAt: new Date().toISOString(),
    content: `PATIENT LABORATORY REPORT
Patient Name: Robert Harrison
Date of Birth: 10/12/1967 (Age: 58)
Date of Collection: June 15, 2026
Physician: Dr. Helena Vance, MD

====================================================================
TEST PROFILE: COMPLETE BLOOD COUNT (CBC) & METABOLIC BIOCHEMISTRY
====================================================================

HEMATOLOGY SECTION:
-------------------
White Blood Cell Count (WBC)   : 6.8 x10^3/uL     (Normal Range: 4.5 - 11.0 x10^3/uL)
Red Blood Cell Count (RBC)     : 4.20 x10^6/uL    (Normal Range: 4.30 - 5.90 x10^6/uL)   [LOW]
Hemoglobin (Hgb)               : 12.1 g/dL        (Normal Range: 13.5 - 17.5 g/dL)       [LOW]
Hematocrit (Hct)               : 36.2 %           (Normal Range: 41.0 - 53.0 %)          [LOW]
Platelets Count                : 250 x10^3/uL     (Normal Range: 150 - 450 x10^3/uL)

METABOLIC & GLUCOSE SECTION:
----------------------------
Fasting Blood Glucose          : 104 mg/dL        (Normal Range: 70 - 99 mg/dL)          [HIGH]
Hemoglobin A1c (HbA1c)         : 5.8 %            (Normal Range: < 5.7%)                 [HIGH - PREDIABETIC]

LIPID CARDIOVASCULAR PANEL:
---------------------------
Total Cholesterol              : 245 mg/dL        (Normal Range: < 200 mg/dL)            [HIGH]
LDL Cholesterol (Bad)          : 165 mg/dL        (Normal Range: < 100 mg/dL)            [HIGH]
HDL Cholesterol (Good)         : 42 mg/dL         (Normal Range: > 40 mg/dL)
Triglycerides                  : 190 mg/dL        (Normal Range: < 150 mg/dL)            [HIGH]

RENAL (KIDNEY) FUNCTION PANEL:
------------------------------
Serum Creatinine               : 0.90 mg/dL       (Normal Range: 0.60 - 1.20 mg/dL)
Blood Urea Nitrogen (BUN)      : 18 mg/dL         (Normal Range: 7 - 20 mg/dL)
eGFR (Glomerular Filtration)   : 85 mL/min/1.73m2  (Normal Range: > 90 mL/min/1.73m2)     [MILDLY DECREASED]

LIVER FUNCTION PANEL:
---------------------
ALT (Alanine Aminotransferase) : 28 U/L           (Normal Range: 7 - 56 U/L)
AST (Aspartate Aminotrans.)    : 24 U/L           (Normal Range: 10 - 40 U/L)
Albumin                        : 4.2 g/dL         (Normal Range: 3.5 - 5.0 g/dL)

CLINICAL NOTES & INTERPRETATION:
Patient exhibits mild microcytic anemia, suggested by borderline low hemoglobin and RBC indices. Total cholesterol and LDL fractions are moderately elevated, suggesting hyperlipidemia requiring dietary modification and therapeutic follow-up. Impaired fasting glucose and prediabetic HbA1c suggest glucose intolerance; lifestyle modifications are indicated.`
  },
  {
    id: 'sample-cardio-consult',
    title: 'Cardiology Clinic Consultation Summary',
    type: 'doctor_note',
    isSample: true,
    addedAt: new Date().toISOString(),
    content: `VANCE CARDIOLOGY GROUP
Clinical Consultation Report
Date of Consultation: June 18, 2026

Patient Name: Robert Harrison
DOB: 10/12/1967
Vitals: BP 138/86 mmHg | HR 74 bpm (Regular) | Temp 98.4 F | O2 Sat 98% on room air

REASON FOR VISIT:
Mr. Harrison presents for a routine 6-month follow-up of hypertension, hyperlipidemia, and cardiovascular risk evaluation.

HISTORY OF PRESENT ILLNESS:
The patient reports compliance with current medications. He complains of mild, generalized fatigue in the late afternoons but denies any exertional chest pain, pressure, dyspnea on exertion, orthopnea, palpitations, or lightheadedness. Overall functional status remains intact.

ACTIVE MEDICATIONS:
1. Lisinopril 10 mg PO daily (for blood pressure control)
2. Atorvastatin 20 mg PO daily (for high cholesterol)
3. Aspirin 81 mg PO daily (cardioprotection)

PHYSICAL EXAMINATION SUMMARY:
- Cardiovascular: Normal S1, S2, no murmurs, rubs, or gallops. Heart rate regular at 74 bpm. No peripheral edema noted.
- Respiratory: Lungs clear to auscultation bilaterally. No wheezes or crackles.
- Abdomen: Soft, non-distended, non-tender.
- Neck: No jugular venous distention (JVD). No carotid bruits.

CLINICAL ASSESSMENT & PLAN:
1. HYPERTENSION: Well-controlled on Lisinopril. BP today is 138/86 mmHg. Goal is <130/80 mmHg. We will continue Lisinopril 10mg daily and emphasize a low-sodium DASH diet.
2. HYPERLIPIDEMIA: Based on the laboratory panel from June 15, 2026, the patient's LDL cholesterol is elevated at 165 mg/dL despite Atorvastatin 20mg. We will titrate Atorvastatin up to 40 mg PO daily to target an LDL goal of <100 mg/dL (optimally <70 mg/dL given cardiovascular risk factors).
3. IMPAIRED FASTING GLUCOSE / PREDIABETES: Fasting glucose (104 mg/dL) and HbA1c (5.8%) indicate borderline glycemic regulation. The patient is advised to reduce refined carbohydrate intake and participate in regular aerobic physical activity.
4. LIFESTYLE EXERCISE: Recommend moderate-intensity exercise (e.g., brisk walking, cycling) for at least 150 minutes per week.
5. FOLLOW-UP: The patient will return in 6-8 weeks with a repeat lipid profile (LDL, HDL, Triglycerides) and fasting blood glucose to assess therapeutic response to the Atorvastatin dosage increase.

Helena Vance, MD, FACC
Board Certified in Cardiovascular Disease`
  },
  {
    id: 'sample-endocrine-thyroid',
    title: 'Thyroid Function & Metabolism Panel',
    type: 'blood_report',
    isSample: true,
    addedAt: new Date().toISOString(),
    content: `METROPOLITAN ENDOCRINOLOGY CLINIC
Hormonal and Metabolic Analysis
Date of Testing: June 10, 2026

Patient Name: Robert Harrison
Physician Ref: Dr. Helena Vance, MD

====================================================================
TEST PROFILE: THYROID FUNCTION TESTS (TFT)
====================================================================

TEST NAME                      RESULTS            NORMAL REFERENCE RANGE
--------------------------------------------------------------------
Thyroid Stimulating Hormone (TSH) : 5.25 uIU/mL     (Normal: 0.45 - 4.50 uIU/mL)      [HIGH]
Free Thyroxine (FT4)           : 0.82 ng/dL       (Normal: 0.82 - 1.77 ng/dL)       [BORDERLINE LOW]
Free Triiodothyronine (FT3)    : 2.1 pg/mL        (Normal: 2.0 - 4.4 pg/mL)

PATIENT SYMPTOMS AND LOG:
- Patient reports recent weight gain of 6 lbs over 3 months despite regular diet.
- Complaints of mild cold sensitivity (hands/feet feeling cold frequently).
- Noticeable skin dryness on arms and shins.
- Mild morning sluggishness.

CLINICAL IMPRESSION:
The lab results show an elevated TSH level (5.25 uIU/mL) in the presence of a borderline low Free T4 (0.82 ng/dL). This biochemical pattern, in conjunction with the reported symptoms of weight gain, cold intolerance, dry skin, and sluggishness, is highly characteristic of mild subclinical hypothyroidism.

TREATMENT RECOMMENDATION:
1. Start low-dose thyroid replacement therapy: Levothyroxine 25 mcg PO daily, to be taken first thing in the morning on an empty stomach (30-60 minutes before food or coffee).
2. Retest TSH and Free T4 in 8 weeks to determine if dosage adjustment is required to achieve target TSH range (0.5 to 2.5 uIU/mL).
3. Avoid taking calcium or iron supplements within 4 hours of Levothyroxine administration, as these can severely impair absorption.

Approved by:
Julian Mercer, MD
Staff Endocrinologist`
  }
];

export const JARGON_DICTIONARY: Record<string, string> = {
  'WBC': 'White Blood Cells - part of the immune system that fights infections.',
  'RBC': 'Red Blood Cells - cells that carry oxygen from your lungs to the rest of your body.',
  'Hemoglobin': 'Hgb - a protein in red blood cells that carries oxygen. Low levels indicate anemia.',
  'Hematocrit': 'Hct - the percentage of blood volume made up of red blood cells. Low levels indicate anemia.',
  'Platelets': 'Cell fragments that help the blood clot and stop bleeding.',
  'Glucose': 'Blood sugar - the primary source of energy for your body\'s cells. Elevated levels suggest prediabetes or diabetes.',
  'HbA1c': 'A test measuring average blood sugar levels over the past 3 months. 5.7%-6.4% indicates prediabetes.',
  'LDL': 'Low-Density Lipoprotein - "bad" cholesterol. Builds up in artery walls, increasing heart disease risk.',
  'HDL': 'High-Density Lipoprotein - "good" cholesterol. Helps clear cholesterol from the bloodstream.',
  'Triglycerides': 'A type of fat found in the blood. High levels can increase the risk of heart disease.',
  'Creatinine': 'A chemical waste product generated by muscle metabolism, filtered out by the kidneys. High levels indicate kidney stress.',
  'eGFR': 'Estimated Glomerular Filtration Rate - measures how well kidneys filter waste. Normal is above 90; lower values indicate reduced function.',
  'BUN': 'Blood Urea Nitrogen - a waste product from protein breakdown. Used to check kidney function.',
  'ALT': 'Alanine Aminotransferase - an enzyme found mostly in liver cells. High levels suggest liver injury.',
  'AST': 'Aspartate Aminotransferase - an enzyme in the liver, heart, and muscles. Elevated levels point to liver or muscle cell stress.',
  'Lisinopril': 'An ACE inhibitor medication used to treat high blood pressure (hypertension) and heart failure.',
  'Atorvastatin': 'A statin medication used to lower cholesterol and prevent cardiovascular events (like heart attacks).',
  'Levothyroxine': 'A synthetic thyroid hormone used to treat thyroid hormone deficiency (hypothyroidism).',
  'Subclinical Hypothyroidism': 'A mild form of underactive thyroid where thyroid stimulating hormone (TSH) is slightly elevated, but active thyroid hormones (Free T4) are still normal.',
  'Microcytic Anemia': 'A condition where the body has fewer red blood cells than normal, and they are smaller than usual, often due to iron deficiency.',
  'Hyperlipidemia': 'High levels of lipids (fats like cholesterol and triglycerides) in the blood.',
  'Hypertension': 'High blood pressure, clinically defined as blood pressure above 130/80 mmHg.',
  'DASH diet': 'Dietary Approaches to Stop Hypertension - rich in fruits, vegetables, whole grains, and low-fat dairy, while low in sodium.',
  'eGfr (Glomerular Filtration)': 'Estimated Glomerular Filtration Rate - indicates kidney filtration rate.',
  'TSH': 'Thyroid Stimulating Hormone - tells the thyroid gland to release thyroid hormones. Elevated levels indicate the body is screaming for more thyroid hormone (hypothyroidism).',
  'Free T4': 'Thyroxine - the primary hormone produced and released into the bloodstream by the thyroid gland.',
  'Free T3': 'Triiodothyronine - the active form of thyroid hormone that regulates metabolism.',
  'uIU/mL': 'Micro-international units per milliliter - standard concentration unit for thyroid tests.',
  'PO': 'Per Os - medical shorthand for "by mouth" (orally).',
  'FACC': 'Fellow of the American College of Cardiology - represents high standing in the cardiology profession.'
};
