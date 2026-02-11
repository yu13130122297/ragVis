/**
 * Demo Documents for RAG-Weaver
 * Real medical documents for demonstration purposes
 */

export interface DemoDocument {
  id: string
  title: string
  source: string
  content: string
  category: string
  lastUpdated: Date
}

export const DEMO_DOCUMENTS: DemoDocument[] = [
  {
    id: "doc-001",
    title: "Heart Failure Treatment Guidelines",
    source: "Clinical Practice Guidelines",
    category: "Cardiovascular",
    lastUpdated: new Date("2024-01-15"),
    content: `Heart failure (HF) is a clinical syndrome characterized by typical symptoms (e.g., dyspnea, ankle swelling, and fatigue) that may be accompanied by signs (e.g., elevated jugular venous pressure, pulmonary crackles, and peripheral edema).

Treatment of HFrEF (Heart Failure with reduced Ejection Fraction):

1. **Angiotensin-Converting Enzyme (ACE) Inhibitors**: First-line therapy for all patients with HFrEF unless contraindicated. Recommended doses: enalapril 10-20mg twice daily, lisinopril 10-20mg daily.

2. **Beta-Blockers**: Proven to reduce mortality and hospitalization. Bisoprolol (5-10mg daily), carvedilol (25-50mg twice daily), and metoprolol succinate (200mg daily) are recommended.

3. **Mineralocorticoid Receptor Antagonists (MRA)**: Spironolactone (25-50mg daily) or eplerenone (50mg daily) for patients with persistent symptoms despite ACE inhibitors and beta-blockers.

4. **SGLT2 Inhibitors**: Dapagliflozin (10mg daily) or empagliflozin (10mg daily) significantly reduce HF hospitalization and cardiovascular death.

5. **ARNIs**: Sacubitril/valsartan (Entresto) is superior to ACE inhibitors in reducing mortality.

Contraindications include severe hypotension (SBP <90 mmHg), significant renal impairment (eGFR <30 mL/min/1.73m²), and hyperkalemia (K+ >5.0 mmol/L).`
  },
  {
    id: "doc-002",
    title: "Drug Interactions in Cardiovascular Therapy",
    source: "Drug Interaction Database",
    category: "Pharmacology",
    lastUpdated: new Date("2024-02-20"),
    content: `Critical Drug Interactions in Cardiovascular Therapy:

**Warfarin Interactions:**
- **Amiodarone**: Increases warfarin effect, requiring 30-50% dose reduction. Monitor INR every 2-3 days after starting amiodarone.
- **Antibiotics**: Macrolides (azithromycin, clarithromycin) and fluoroquinolones can increase INR. Cephalosporins with N-methylthiotetrazole side chain (cefazolin, cefotetan) may inhibit vitamin K synthesis.
- **NSAIDs**: Increased bleeding risk due to antiplatelet effects and potential gastric irritation.
- **Statins**: Rosuvastatin and simvastatin may have additive effects on INR.

**ACE Inhibitor Interactions:**
- **Potassium Supplements**: Risk of severe hyperkalemia when combined with ACE inhibitors, especially in patients with renal impairment.
- **Lithium**: ACE inhibitors can increase lithium levels by 30-50%, leading to toxicity.
- **Allopurinol**: May increase risk of hypersensitivity reactions when combined with captopril.

**Beta-Blocker Interactions:**
- **Calcium Channel Blockers**: Verapamil and diltiazem with non-dihydropyridine CCBs can cause severe bradycardia and AV block.
- **Insulin**: May mask symptoms of hypoglycemia (tremor, tachycardia).
- **NSAIDs**: May reduce antihypertensive effect of beta-blockers.

**Statins:**
- **CYP3A4 Inhibitors**: Clarithromycin, erythromycin, ketoconazole, itraconazole significantly increase simvastatin and atorvastatin levels, increasing myopathy risk.
- **Grapefruit Juice**: Increases bioavailability of simvastatin, lovastatin, and atorvastatin.

Monitoring Recommendations: For all patients on anticoagulation therapy, regular INR monitoring (every 4-12 weeks when stable) is essential. Any new medication addition requires increased monitoring frequency.`
  },
  {
    id: "doc-003",
    title: "Cancer Immunotherapy Guidelines",
    source: "ASCO Clinical Practice",
    category: "Oncology",
    lastUpdated: new Date("2024-03-10"),
    content: `Immune Checkpoint Inhibitors in Cancer Treatment:

**PD-1/PD-L1 Inhibitors:**
- **Pembrolizumab (Keytruda)**: Approved for melanoma, NSCLC, head and neck cancer, Hodgkin lymphoma, gastric cancer, cervical cancer, and microsatellite instability-high (MSI-H) tumors. Dosing: 200mg IV every 3 weeks or 400mg every 6 weeks.

- **Nivolumab (Opdivo)**: Approved for melanoma, NSCLC, renal cell carcinoma, Hodgkin lymphoma, head and neck cancer, urothelial carcinoma, colorectal cancer (MSI-H), and hepatocellular carcinoma. Dosing: 240mg IV every 2 weeks or 480mg every 4 weeks.

- **Atezolizumab (Tecentriq)**: Approved for NSCLC, urothelial carcinoma, and hepatocellular carcinoma. Dosing: 1200mg IV every 3 weeks.

**CTLA-4 Inhibitors:**
- **Ipilimumab (Yervoy)**: Approved for melanoma and renal cell carcinoma. Dosing: 3mg/kg IV every 3 weeks for up to 4 doses.

**Immune-Related Adverse Events (irAEs):**

1. **Dermatologic**: Rash, pruritus (30-40% of patients). Management: Topical steroids for mild cases, systemic steroids (prednisone 0.5-1mg/kg) for moderate/severe cases.

2. **Gastrointestinal**: Colitis (5-10% with PD-1 inhibitors, 10-15% with CTLA-4). Management: IV methylprednisolone 1-2mg/kg for grade 2-3, infliximab for steroid-refractory cases.

3. **Endocrine**: Hypophysitis (1-5%), thyroiditis (5-10%), type 1 diabetes (<1%). Management: Hormone replacement therapy; continue immunotherapy unless severe.

4. **Pulmonary**: Pneumonitis (3-5%). High mortality if not recognized early. Management: Discontinue immunotherapy, high-dose steroids (1-2mg/kg prednisone equivalent), consider infliximab for refractory cases.

5. **Hepatic**: Hepatitis (2-5%). Management: Steroids per grade; monitor LFTs weekly during treatment.

Contraindications: Autoimmune diseases requiring systemic immunosuppression, organ transplant recipients, uncontrolled infections.`
  },
  {
    id: "doc-004",
    title: "Diabetes Mellitus Clinical Practice",
    source: "ADA Standards of Care",
    category: "Endocrinology",
    lastUpdated: new Date("2024-01-28"),
    content: `Standards of Medical Care in Diabetes:

**Glycemic Targets:**
- **A1C Target**: <7.0% for most adults; <6.5% for younger, healthier patients if achievable without hypoglycemia; <8.0% for patients with limited life expectancy or history of severe hypoglycemia.

- **Fasting/Preprandial Glucose**: 80-130 mg/dL (4.4-7.2 mmol/L)
- **Postprandial Glucose (1-2 hours)**: <180 mg/dL (10.0 mmol/L)

**Pharmacologic Therapy:**

1. **Metformin**: First-line medication for type 2 diabetes unless contraindicated. Starting dose: 500mg once daily with food; titrate to 2000mg daily as tolerated. Contraindications: eGFR <30 mL/min/1.73m².

2. **SGLT2 Inhibitors**: Empagliflozin, dapagliflozin, canagliflozin. Indicated for patients with established ASCVD, HF, or CKD. Beneficial effects: reduce HF hospitalization by 30-35%, slow CKD progression.

3. **GLP-1 Receptor Agonists**: Liraglutide, semaglutide, dulaglutide, exenatide. Indicated for patients with ASCVD, obesity, or inadequate glycemic control with metformin. Semaglutide (Ozempic) also indicated for weight management.

4. **DPP-4 Inhibitors**: Sitagliptin, linagliptin, saxagliptin. Weight-neutral, minimal hypoglycemia risk. Saxagliptin and alogliptin have FDA warnings for increased HF risk.

5. **Insulin**: Basal insulin (glargine, degludec, detemir) for patients with symptomatic hyperglycemia or A1C >10%. Starting dose: 0.1-0.2 units/kg daily.

**Hypoglycemia Management:**
- **Mild (glucose 54-69 mg/dL)**: Oral glucose 15-20g, recheck in 15 minutes
- **Severe (glucose <54 mg/dL or patient unable to swallow)**: Glucagon 1mg IM/SC or dextrose 25g IV bolus

**Screening Recommendations:**
- Annual eye examination (diabetic retinopathy)
- Annual urine albumin-to-creatinine ratio (diabetic nephropathy)
- Annual foot examination (diabetic neuropathy)
- Lipid panel annually (ASCVD risk assessment)`
  },
  {
    id: "doc-005",
    title: "Neurological Adverse Events of Cancer Therapy",
    source: "Neuro-Oncology Review",
    category: "Neurology",
    lastUpdated: new Date("2024-02-05"),
    content: `Neurological Complications of Cancer Therapies:

**Chemotherapy-Induced Peripheral Neuropathy (CIPN):**
- **Caused by**: Platinum agents (cisplatin, oxaliplatin), taxanes (paclitaxel, docetaxel), vincristine, thalidomide, bortezomib.
- **Symptoms**: Sensory symptoms (numbness, tingling, burning pain) starting distally in fingers and toes. Motor weakness and autonomic dysfunction in severe cases.
- **Prevention**: No proven prevention strategies. Calcium/magnesium infusion may reduce oxaliplatin-induced neuropathy.
- **Treatment**: Duloxetine 30-60mg daily (Grade A evidence), gabapentin, pregabalin, topical lidocaine. Dose reduction or discontinuation of causative agent may be necessary.

**Immune-Related Neurological Toxicity:**
- **Aseptic Meningitis**: Headache, neck stiffness, fever. Incidence <1%. Management: High-dose steroids, consider meningitis workup to exclude infection.
- **Encephalitis**: Confusion, memory loss, seizures. Rare (<0.5%). Management: IV methylprednisolone 1-2mg/kg, MRI, EEG.
- **Myasthenia Gravis-like Syndrome**: Ptosis, diplopia, muscle weakness, respiratory compromise. Life-threatening if not recognized. Management: IVIG, plasmapheresis, high-dose steroids.
- **Guillain-Barré Syndrome**: Ascending paralysis, areflexia. Management: IVIG or plasmapheresis, ICU monitoring for respiratory failure.

**Radiation-Induced Neurotoxicity:**
- **Acute**: Fatigue, somnolence syndrome (especially in children). Self-limiting.
- **Early Delayed (1-6 months)**: Lhermitte's sign, transient cognitive decline. Steroids may help.
- **Late Delayed (>6 months)**: Cognitive impairment, leukoencephalopathy, necrosis. Dose-dependent, irreversible.

**CAR-T Cell Therapy Neurotoxicity (ICANS):**
- **Incidence**: 30-50% of patients receiving CAR-T therapy.
- **Symptoms**: Headache, confusion, aphasia, tremor, seizures, cerebral edema.
- **Grading**: 1-4 based on ICE (Immune Effector Cell-Associated Encephalopathy) score.
- **Management**: Grade 1: observation; Grade 2: dexamethasone 10mg IV q6h; Grade 3-4: dexamethasone 10mg IV q6h + tocilizumab, consider ICU admission.

**Prevention and Monitoring:**
- Baseline neurological examination before starting neurotoxic therapy
- Regular monitoring during treatment (every 1-3 cycles)
- Early intervention for symptoms
- Multidisciplinary management involving neurology, oncology, and rehabilitation services`
  },
  {
    id: "doc-006",
    title: "Clinical Trials Evidence Summary",
    source: "Meta-Analysis Database",
    category: "Evidence-Based Medicine",
    lastUpdated: new Date("2024-03-15"),
    content: `Evidence-Based Medicine: Key Clinical Trial Summaries:

**Cardiovascular Trials:**

1. **CIBIS-II (1999)**: Bisoprolol reduced mortality by 34% in heart failure patients. N=2647, followed for 1.3 years.

2. **MERIT-HF (1999)**: Metoprolol succinate reduced mortality by 34% in heart failure. N=3991.

3. **EMPHASIS-HF (2011)**: Eplerenone reduced cardiovascular death/HF hospitalization by 37% in mild heart failure. N=2737.

4. **DAPA-HF (2019)**: Dapagliflozin reduced HF hospitalization by 30% and cardiovascular death by 18% in HFrEF. N=4744, followed 18.2 months.

5. **EMPEROR-Reduced (2020)**: Empagliflozin reduced HF hospitalization by 30% and cardiovascular death by 19% in HFrEF. N=3730.

**Oncology Trials:**

1. **KEYNOTE-024 (2016)**: Pembrolizumab vs chemotherapy as first-line in NSCLC with PD-L1 ≥50%. 5-year OS: 31.9% vs 16.3%.

2. **CheckMate 067 (2015)**: Nivolumab + ipilimumab vs nivolumab vs ipilimumab in melanoma. Combination showed highest response rate (58%) but increased toxicity.

3. **IMpower133 (2018)**: Atezolizumab + chemotherapy improved OS (12.3 vs 10.3 months) in extensive-stage SCLC.

**Diabetes Trials:**

1. **UKPDS (1998)**: Intensive glucose control reduced microvascular complications by 25% in type 2 diabetes. N=3867, followed 10 years.

2. **EMPAREG-OUTCOME (2015)**: Empagliflozin reduced cardiovascular death by 38% and HF hospitalization by 35% in type 2 diabetes with ASCVD.

3. **LEADER (2016)**: Liraglutide reduced cardiovascular death by 22% and all-cause mortality by 15% in type 2 diabetes with ASCVD.

**Evidence Hierarchy:**
1. Meta-analyses of randomized controlled trials
2. Individual randomized controlled trials with large sample sizes
3. Observational studies with large sample sizes
4. Case-control studies
5. Case series

**Number Needed to Treat (NNT) Summary:**
- Beta-blockers in HF: NNT = 4-5 to prevent one death over 1 year
- SGLT2 inhibitors in HF: NNT = 6-7 to prevent one HF hospitalization over 1 year
- Statins in ASCVD: NNT = 8-10 to prevent one cardiovascular event over 5 years
- Aspirin for secondary prevention: NNT = 20-25 to prevent one cardiovascular event over 1 year`
  },
  {
    id: "doc-007",
    title: "Patient Adherence and Medication Management",
    source: "Clinical Practice Review",
    category: "General Medicine",
    lastUpdated: new Date("2024-01-12"),
    content: `Medication Adherence Strategies in Chronic Disease Management:

**Adherence Statistics:**
- Average medication adherence after 6 months: 50-60%
- Cardiovascular medication adherence: ~65% after 1 year
- Diabetes medication adherence: ~60% after 1 year
- Oncology oral chemotherapy adherence: 70-80% during active treatment

**Factors Affecting Adherence:**

1. **Patient-Related**: Health literacy, beliefs about medication, depression, cognitive impairment, forgetfulness, financial constraints.

2. **Medication-Related**: Complexity of regimen, side effects, administration frequency, cost.

3. **Healthcare System-Related**: Poor provider-patient communication, lack of follow-up, prescription refill barriers.

**Intervention Strategies:**

1. **Simplification of Regimen**:
   - Once-daily dosing when possible
   - Fixed-dose combination medications
   - Extended-release formulations

2. **Patient Education**:
   - Clear explanation of medication purpose and expected benefits
   - Discussion of potential side effects and management
   - Written instructions in appropriate language/reading level

3. **Reminders and Follow-up**:
   - Pill organizers, medication alarms
   - Pharmacy refill reminders
   - Scheduled follow-up appointments
   - Digital adherence tools

4. **Addressing Financial Barriers**:
   - Generic substitution when appropriate
   - Patient assistance programs
   - Prior authorization support

**Medication Reconciliation:**
- Should be performed at every encounter, especially transitions of care
- Compare current medications with prescribed medications
- Identify discrepancies (omissions, duplications, dosing errors)
- Update medication list in electronic health record

**Deprescribing Considerations:**
- Evaluate ongoing need for each medication, especially in elderly patients
- Consider deprescribing when: no clear indication, high risk of adverse effects, patient preference
- Use stepwise approach: taper, monitor, reassess
- Common candidates for deprescribing: unnecessary duplicate medications, medications with high fall risk in elderly (benzodiazepines, anticholinergics)

**Monitoring During Chronic Therapy:**
- Baseline assessment before initiation
- Regular monitoring intervals based on medication profile
- Laboratory monitoring (e.g., INR for warfarin, LFTs for statins, renal function for ACE inhibitors)
- Assessment of adverse effects and therapeutic response
- Patient-reported outcomes and quality of life measures`
  },
  {
    id: "doc-008",
    title: "Biomarker-Driven Treatment Selection",
    source: "Precision Medicine Review",
    category: "Precision Medicine",
    lastUpdated: new Date("2024-02-25"),
    content: `Precision Medicine: Biomarker-Guided Cancer Treatment:

**Actionable Biomarkers in Solid Tumors:**

1. **EGFR Mutations** (NSCLC):
   - Activating mutations (exon 19 deletion, L858R) predict response to EGFR TKIs
   - First-line: Osimertinib (Tagrisso)
   - Resistance: T790M mutation (osimertinib still active), C797S mutation (experimental therapies)

2. **ALK Rearrangements** (NSCLC):
   - Detected by FISH or NGS
   - Treatment: Alectinib, brigatinib, lorlatinib (third-generation)
   - Prognosis: Significantly improved outcomes compared to chemotherapy

3. **BRCA1/2 Mutations** (Breast, Ovarian, Pancreatic, Prostate):
   - Homologous recombination deficiency predicts PARP inhibitor response
   - Treatments: Olaparib, rucaparib, niraparib, talazoparib
   - Also sensitive to platinum-based chemotherapy

4. **HER2 Amplification** (Breast, Gastric):
   - Breast: Trastuzumab + pertuzumab + chemotherapy, T-DM1
   - Gastric: Trastuzumab + chemotherapy
   - New agents: Fam-trastuzumab deruxtecan, tucatinib

5. **MSI-H/dMMR** (Multiple cancer types):
   - Predicts response to immune checkpoint inhibitors
   - Tumor-agnostic indication for pembrolizumab
   - Also predictive of response to chemotherapy

6. **PD-L1 Expression** (NSCLC, Urothelial, HNSCC):
   - Biomarker for pembrolizumab first-line in NSCLC (TPS ≥50%)
   - Combined positive score (CPS) for other cancers
   - Limitations: Heterogeneous expression, dynamic changes

7. **KRAS G12C Mutation** (NSCLC, Colorectal):
   - Previously undruggable, now targeted by sotorasib and adagrasib
   - Colorectal: requires combination with EGFR inhibitor

8. **NTRK Fusions** (Multiple cancer types):
   - Tumor-agnostic indication for larotrectinib and entrectinib
   - Rare (<1% of cancers) but highly effective when present

**Testing Recommendations:**
- Comprehensive NGS profiling recommended for all advanced solid tumors
- Reflex testing for actionable biomarkers at diagnosis
- Repeat testing at progression for resistance mechanisms
- Consider liquid biopsy when tissue unavailable

**Future Directions:**
- Multi-omic approaches (genomics, transcriptomics, proteomics)
- Circulating tumor DNA for monitoring
- Artificial intelligence for biomarker discovery
- Combination strategies targeting multiple pathways simultaneously

**Challenges:**
- Tumor heterogeneity
- Temporal evolution of biomarkers
- Access and cost considerations
- Interpretation of variants of unknown significance
- Integration into clinical workflow`
  },
  {
    id: "doc-009",
    title: "Drug Safety Monitoring Requirements",
    source: "Pharmacovigilance Guidelines",
    category: "Pharmacology",
    lastUpdated: new Date("2024-03-01"),
    content: `Drug Safety Monitoring: Essential Parameters:

**Laboratory Monitoring Schedule:**

**Warfarin:**
- Baseline: INR, CBC, LFTs
- During initiation: INR every 1-3 days until stable (2 consecutive therapeutic INRs)
- Stable: INR every 4-12 weeks, more frequently if medication changes
- Therapeutic range: INR 2.0-3.0 for most indications (2.5-3.5 for mechanical mitral valve)

**ACE Inhibitors:**
- Baseline: Serum creatinine, eGFR, potassium, BP
- After initiation: Creatinine and potassium at 1-2 weeks
- Stable: Annual monitoring, more frequent if dose changes or renal impairment

**Beta-Blockers:**
- Baseline: HR, BP, blood glucose (if diabetic)
- After initiation: HR and BP at 2-4 weeks
- Stable: Annual monitoring

**Statins:**
- Baseline: LFTs (ALT, AST), lipid profile
- After initiation: LFTs at 12 weeks
- Stable: Annual LFTs if symptoms develop; otherwise not routinely required
- Myopathy warning: Discontinue if CK >10x ULN with symptoms

**Amiodarone:**
- Baseline: TFTs (TSH, free T4), LFTs, CXR, ECG, pulmonary function tests
- Monitoring: TFTs every 6 months, LFTs every 6 months, CXR annually, PFTs annually
- Duration effects: Pulmonary toxicity risk increases with cumulative dose

**Methotrexate:**
- Baseline: CBC, LFTs, renal function
- Monitoring: CBC and LFTs every 1-3 months during therapy
- Folic acid supplementation: 1mg daily (or 5mg weekly) to reduce toxicity

**Azathioprine/6-MP:**
- Baseline: CBC, LFTs, TPMT activity
- Monitoring: CBC weekly for first month, then every 2-4 weeks; LFTs every 3 months

**Lithium:**
- Baseline: Lithium level, thyroid function, renal function, ECG
- Monitoring: Lithium level every 5-7 days after initiation, every 3 months when stable; TFTs and creatinine every 6-12 months
- Therapeutic range: 0.6-1.2 mEq/L

**Digoxin:**
- Baseline: Serum digoxin level, renal function, electrolytes (K+, Mg2+)
- Monitoring: Digoxin level 7-14 days after initiation or dose change; annually if stable
- Therapeutic range: 0.5-0.9 ng/mL for heart failure, 0.8-2.0 ng/mL for atrial fibrillation

**General Principles:**
1. Know your baseline values before starting therapy
2. Monitor more frequently during initiation and dose titration
3. Individualize monitoring based on patient risk factors
4. Document both normal and abnormal values
5. Educate patients about symptoms requiring urgent evaluation
6. Consider drug-drug interactions when adding or stopping medications

**Red Flags Requiring Urgent Evaluation:**
- INR >5.0 without bleeding, >3.0 with bleeding
- Creatinine increase >50% from baseline
- ALT/AST >3x ULN with symptoms, >5x ULN without symptoms
- Potassium >5.5 mEq/L or <3.0 mEq/L
- New onset atrial fibrillation or significant bradycardia (<50 bpm)`
  },
  {
    id: "doc-010",
    title: "Long-Term Outcomes of Early Treatment",
    source: "Longitudinal Study Review",
    category: "General Medicine",
    lastUpdated: new Date("2024-02-18"),
    content: `Long-Term Outcomes of Early Intervention in Chronic Diseases:

**Cardiovascular Disease:**

1. **Early ACE Inhibitor Therapy in Heart Failure:**
   - SOLVD Prevention Trial (1992): Early treatment of asymptomatic LV dysfunction reduced progression to symptomatic HF by 37%
   - 10-year follow-up: 23% absolute reduction in all-cause mortality
   - Conclusion: Initiate ACE inhibitors at diagnosis, regardless of symptom severity

2. **Early Statin Therapy after ACS:**
   - PROVE IT-TIMI 22 (2004): High-intensity statin (atorvastatin 80mg) vs standard (pravastatin 40mg)
   - 2-year follow-up: 16% reduction in composite endpoint
   - Long-term benefit: Lower LDL cholesterol associated with lower event rates across follow-up

3. **Early Anticoagulation in Atrial Fibrillation:**
   - RELY and ARISTOTLE trials: Early initiation reduced stroke risk by 60-65%
   - Delay >2 weeks from diagnosis associated with 2-fold increased stroke risk
   - Early treatment also reduces cognitive decline risk

**Diabetes Mellitus:**

1. **UKPDS Follow-up (2008)**: 10-year post-trial follow-up showed legacy effect
   - Early intensive glycemic control group: 15% reduction in MI and 13% reduction in all-cause mortality
   - Benefit persisted despite equalization of A1C levels after trial completion
   - Conclusion: Early glycemic control has long-term protective effects

2. **Early SGLT2 Inhibitor Use:**
   - EMPA-REG OUTCOME: Reduced HF hospitalization by 35%, cardiovascular death by 38%
   - Benefit observed across all CKD stages, suggesting early intervention prevents progression
   - Current guidelines: Recommend SGLT2 inhibitors early after diagnosis if ASCVD/HF risk factors present

**Oncology:**

1. **Early Treatment in NSCLC:**
   - KEYNOTE-024: First-line pembrolizumab improved 5-year survival from 16.3% to 31.9%
   - Early initiation before chemotherapy preserved quality of life
   - Tissue-agnostic treatments (MSI-H, NTRK fusions) require early molecular testing

2. **Adjuvant Therapy in Breast Cancer:**
   - ATAC and BIG 1-98 trials: 5 years of aromatase inhibitors vs tamoxifen
   - 10-year follow-up: 2.8% absolute improvement in disease-free survival
   - Early adjuvant therapy reduces recurrence risk by 30-40%

**Neurological Conditions:**

1. **Multiple Sclerosis Disease-Modifying Therapy:**
   - Early treatment with high-efficacy DMTs reduces disability accumulation
   - BENEFIT study: Early interferon beta-1a delayed conversion to clinically definite MS by 50%
   - Window of opportunity concept: Treatment most effective in early inflammatory phase

2. **Parkinson's Disease:**
   - ELLDOPA study: Early levodopa does not accelerate disease progression
   - Motor symptoms and quality of life significantly improved with early treatment
   - Neuroprotective strategies remain area of active research

**Key Principles for Early Intervention:**

1. **Screening and Early Detection:**
   - Hypertension screening every 2 years, annually if risk factors present
   - Diabetes screening at age 35, or earlier with risk factors
   - Cancer screening per guideline recommendations

2. **Therapeutic Window:**
   - Most diseases show greatest benefit with early treatment
   - Delayed treatment often leads to irreversible damage
   - Risk/benefit ratio changes with disease progression

3. **Patient Selection:**
   - Identify patients most likely to benefit from early intervention
   - Consider comorbidities, life expectancy, patient preferences
   - Shared decision-making essential

4. **Monitoring for Treatment Success:**
   - Establish clear treatment goals
   - Regular assessment of outcomes
   - Adjust therapy based on response

**Economic Considerations:**
- Early treatment reduces long-term healthcare costs
- Cost-effectiveness demonstrated for many preventive therapies
- Value-based care emphasizes outcomes over initial cost`
  },
  {
    id: "doc-011",
    title: "Alternative Therapy Considerations",
    source: "Integrative Medicine Review",
    category: "General Medicine",
    lastUpdated: new Date("2024-02-12"),
    content: `Alternative and Complementary Approaches in Medical Treatment:

**Evidence-Based Complementary Therapies:**

1. **Cardiovascular Health:**
   - **Omega-3 Fatty Acids**: EPA + DHA 2-4g daily reduces triglycerides by 20-50%, may reduce cardiovascular events (REDUCE-IT trial)
   - **Coenzyme Q10**: 100-200mg daily may improve HF symptoms (Q-SYMBIO trial showed modest benefit)
   - **Magnesium Supplementation**: 300-400mg daily may reduce blood pressure 2-3 mmHg in hypertensive patients

2. **Diabetes Management:**
   - **Cinnamon**: 1-6g daily may modestly reduce A1C (0.2-0.4%), but evidence mixed
   - **Chromium**: Limited evidence for glycemic benefit, not routinely recommended
   - **Berberine**: 500mg TID shows glucose-lowering effect comparable to metformin in small studies; drug interactions possible

3. **Pain Management:**
   - **Acupuncture**: Effective for chronic low back pain, osteoarthritis knee pain, migraine prevention
   - **Curcumin (Turmeric)**: 500-2000mg daily may reduce inflammation; bioavailability enhanced with piperine
   - **Capsaicin**: Topical 0.075% cream effective for osteoarthritis and neuropathic pain

4. **Mental Health:**
   - **St. John's Wort**: Effective for mild-moderate depression (comparable to SSRIs); interacts with many medications (CYP450)
   - **Omega-3**: EPA-predominant formulations may have antidepressant effect (1-2g daily)
   - **Mindfulness-Based Stress Reduction**: Effective for anxiety, depression, chronic pain

**When to Consider Alternative Therapies:**

1. **As Adjunct to Conventional Therapy**: When conventional therapy provides partial relief or causes side effects

2. **Patient Preference**: When patients express interest and no contraindications exist

3. **Specific Indications**: Where evidence supports efficacy for particular conditions

**Important Contraindications and Interactions:**

1. **St. John's Wort**: CYP3A4/P-gp inducer, reduces levels of warfarin, oral contraceptives, immunosuppressants, many others

2. **Garlic Supplements**: May increase bleeding risk with anticoagulants

3. **Ginkgo Biloba**: Increases bleeding risk, interacts with warfarin and antiplatelet agents

4. **Kava**: Risk of hepatotoxicity, may interact with CNS depressants

5. **Ephedra**: Banned in many countries due to cardiovascular risk

**Approach to Integrative Care:**

1. **Take Complete History**: Ask about all supplements, herbs, and alternative therapies

2. **Evaluate Evidence**: Discuss strength of evidence for proposed therapy

3. **Identify Interactions**: Check for potential drug-herb interactions

4. **Set Expectations**: Define realistic goals and timeline for benefit

5. **Monitor Outcomes**: Assess efficacy and safety during follow-up

**When to Avoid Alternative Therapy:**

1. **Life-threatening conditions requiring proven treatments**

2. **Pregnancy and breastfeeding** (many herbal supplements lack safety data)

3. **Surgery within 2 weeks** (many supplements affect bleeding risk)

4. **Severe organ dysfunction** (altered metabolism may increase toxicity risk)

5. **When evidence suggests potential harm**

**Red Flags:**

- Promises of "cure" for serious conditions

- Claims of "no side effects"

- Marketing without peer-reviewed evidence

- Pressure to discontinue conventional therapy

- Extremely high cost for unproven benefits

**Shared Decision-Making:**

- Discuss patient's goals, values, and concerns

- Present evidence for and against alternative therapy

- Discuss potential benefits, risks, and costs

- Agree on monitoring plan and criteria for discontinuation

**Documentation:**

- Record all supplements and alternative therapies in medical record

- Document patient preferences and treatment decisions

- Note reasons for choosing or declining specific therapies`
  },
  {
    id: "doc-012",
    title: "Drug Interaction Risk Assessment Framework",
    source: "Clinical Pharmacology Review",
    category: "Pharmacology",
    lastUpdated: new Date("2024-03-05"),
    content: `Systematic Approach to Drug Interaction Assessment:

**Classification of Drug Interactions by Severity:**

**Category X (Contraindicated):**
- **Definition**: Combination should NEVER be used due to life-threatening consequences
- **Examples**:
  - Pimozide + CYP3A4 inhibitors (QT prolongation, torsades)
  - Thioridazine + CYP2D6 inhibitors (QT prolongation)
  - Ergot derivatives + CYP3A4 inhibitors (ergotism)
  - MAO inhibitors + sympathomimetics (hypertensive crisis)

**Category D (Major):**
- **Definition**: Combination should be avoided; consider alternative therapy
- **Examples**:
  - Warfarin + amiodarone (INR elevation 2-3 fold)
  - Statins + macrolide antibiotics (rhabdomyolysis risk)
  - ACE inhibitors + potassium-sparing diuretics (severe hyperkalemia)
  - QT-prolonging agents + other QT-prolonging drugs (torsades)

**Category C (Moderate):**
- **Definition**: Combination may be used with monitoring or dose adjustment
- **Examples**:
  - Metformin + cimetidine (reduced renal clearance)
  - Beta-blockers + NSAIDs (reduced antihypertensive effect)
  - Diuretics + lithium (increased lithium levels)
  - Oral contraceptives + broad-spectrum antibiotics (reduced efficacy)

**Category B (Minor):**
- **Definition**: Usually no action required
- **Examples**:
  - PPIs + clopidogrel (controversial, may reduce platelet effect)
  - H2 blockers + iron supplements (reduced absorption)
  - Vitamin K + warfarin (requires monitoring, not contraindicated)

**Mechanism-Based Assessment:**

1. **Pharmacokinetic Interactions**:
   - **CYP450**: Inhibition or induction of metabolism
     - CYP3A4 inhibitors: ketoconazole, clarithromycin, grapefruit juice
     - CYP3A4 inducers: rifampin, carbamazepine, St. John's wort
   - **P-glycoprotein**: Altered transport across membranes
   - **Protein Binding**: Displacement from albumin (usually clinically insignificant)
   - **Renal Excretion**: Competition for tubular secretion

2. **Pharmacodynamic Interactions**:
   - **Synergistic**: Additive or multiplicative effects (e.g., two anticoagulants)
   - **Antagonistic**: Opposing effects (e.g., NSAIDs + antihypertensives)
   - **Toxicity Synergy**: Shared side effect profiles (e.g., QT prolongation)

**Risk Assessment Framework:**

1. **Identify Interactions**:
   - Use drug interaction database (Lexicomp, Micromedex)
   - Consider all medications, supplements, and OTC products
   - Review patient medication list regularly

2. **Assess Clinical Relevance**:
   - Severity of interaction
   - Therapeutic index of affected drug(s)
   - Patient-specific risk factors (age, renal/hepatic function)
   - Duration of co-administration

3. **Develop Management Plan**:
   - **Avoid**: Discontinue or substitute one medication
   - **Adjust**: Modify dose or timing of administration
   - **Monitor**: Increased frequency of lab monitoring or clinical assessment
   - **Accept**: If benefit outweighs risk, with patient consent

4. **Document and Communicate**:
   - Document interaction in medical record
   - Discuss with patient and obtain informed consent
   - Coordinate with other prescribers
   - Provide written instructions for monitoring

**Special Populations:**

**Elderly:**
- Increased interaction risk due to polypharmacy
- Reduced clearance increases interaction severity
- Falls, confusion, GI bleeding as sentinel events

**Renal Impairment:**
- Accumulation of renally cleared drugs
- Increased severity of pharmacokinetic interactions
- Dose adjustments often required

**Hepatic Impairment:**
- Impaired metabolism increases interaction risk
- Albumin deficiency increases free drug fraction
- Closer monitoring of all interactions

**Prevention Strategies:**

1. **Medication Reconciliation**: At every encounter, especially transitions of care

2. **Deprescribing**: Regular review for discontinuation of unnecessary medications

3. **Single Prescriber**: When possible, limit number of prescribers

4. **Pharmacy Integration**: Leverage pharmacist expertise in interaction screening

5. **Electronic Health Record Alerts**: Configured appropriately to avoid alert fatigue

**Red Flag Combinations Requiring Immediate Action:**

- MAOI + sympathomimetic → Immediate evaluation for hypertensive crisis
- Warfarin + interacting antibiotic with bleeding → STAT INR
- Statin + strong CYP3A4 inhibitor with myalgias → CK level, consider discontinuation
- Multiple QT-prolonging drugs with syncope → ECG, discontinue QT-prolonging agents

**Patient Education:**

- Explain purpose of each medication
- Discuss potential interactions with OTC products and supplements
- Instruct to report new symptoms promptly
- Provide contact information for urgent questions`
  }
]

// Split documents into chunks for better retrieval
export function chunkDocuments(documents: DemoDocument[], chunkSize: number = 300): Array<{
  id: string
  documentId: string
  text: string
  metadata: {
    title: string
    source: string
    category: string
    chunkIndex: number
    totalChunks: number
  }
}> {
  const chunks: Array<{
    id: string
    documentId: string
    text: string
    metadata: {
      title: string
      source: string
      category: string
      chunkIndex: number
      totalChunks: number
    }
  }> = []

  for (const doc of documents) {
    const sentences = doc.content.split(/(?<=[.!?])\s+/)
    let currentChunk = ""
    let chunkIndex = 0

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 50) {
        chunks.push({
          id: `${doc.id}-chunk-${chunkIndex}`,
          documentId: doc.id,
          text: currentChunk.trim(),
          metadata: {
            title: doc.title,
            source: doc.source,
            category: doc.category,
            chunkIndex,
            totalChunks: Math.ceil(doc.content.length / chunkSize),
          },
        })
        currentChunk = sentence
        chunkIndex++
      } else {
        currentChunk += " " + sentence
      }
    }

    if (currentChunk.trim()) {
      chunks.push({
        id: `${doc.id}-chunk-${chunkIndex}`,
        documentId: doc.id,
        text: currentChunk.trim(),
        metadata: {
          title: doc.title,
          source: doc.source,
          category: doc.category,
          chunkIndex,
          totalChunks: Math.ceil(doc.content.length / chunkSize),
        },
      })
    }
  }

  return chunks
}
