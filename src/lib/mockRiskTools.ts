import { GuidelineResource, RiskAssessmentTool } from '../app/components/GuidelineDetail';

export const mockRiskTools: { [key: string]: RiskAssessmentTool[] } = {
  // Breast cancer related risk assessment tools
  breast: [
    {
      id: 'brca-gail',
      name: 'Breast Cancer Risk Assessment Tool (Gail Model)',
      description:
        "Estimates a woman's risk of developing invasive breast cancer over the next 5 years and up to age 90",
      url: 'https://bcrisktool.cancer.gov/',
      organization: 'National Cancer Institute',
      tags: ['breast cancer', 'risk assessment', 'gail model'],
    },
    {
      id: 'ibis',
      name: 'IBIS Breast Cancer Risk Evaluation Tool',
      description:
        'Calculates the likelihood of developing breast cancer based on family history, reproductive factors, and other risk factors',
      url: 'https://www.ems-trials.org/riskevaluator/',
      organization: 'Cancer Research UK',
      tags: ['breast cancer', 'risk prediction', 'family history'],
    },
    {
      id: 'bcsc',
      name: 'Breast Cancer Surveillance Consortium Risk Calculator',
      description:
        'Estimates 5-year and 10-year risk of invasive breast cancer based on demographic factors and breast density',
      url: 'https://tools.bcsc-scc.org/BC5yearRisk/calculator.htm',
      organization: 'Breast Cancer Surveillance Consortium',
      tags: ['breast cancer', 'breast density', 'risk calculator'],
    },
  ],

  // Colorectal cancer related risk assessment tools
  colorectal: [
    {
      id: 'nci-colorectal',
      name: 'Colorectal Cancer Risk Assessment Tool',
      description: 'Estimates 5-year, 10-year, and lifetime risk of developing colorectal cancer',
      url: 'https://ccrisktool.cancer.gov/',
      organization: 'National Cancer Institute',
      tags: ['colorectal cancer', 'risk assessment', 'lifestyle factors'],
    },
    {
      id: 'qcancer-colorectal',
      name: 'QCancer® Colorectal',
      description:
        'Calculates risk of developing colorectal cancer within the next 10 years based on risk factors',
      url: 'https://qcancer.org/colorectal/',
      organization: 'QResearch',
      tags: ['colorectal cancer', 'early detection', 'risk factors'],
    },
  ],

  // Cervical cancer related risk assessment tools
  cervical: [
    {
      id: 'cervical-risk',
      name: 'Cervical Cancer Risk Assessment Tool',
      description: 'Evaluates risk based on HPV status, screening history, and other factors',
      url: 'https://cervicalcancerrisk.org/',
      organization: 'American Cancer Society',
      tags: ['cervical cancer', 'HPV', 'pap test'],
    },
  ],

  // Prostate cancer related risk assessment tools
  prostate: [
    {
      id: 'pcpt',
      name: 'Prostate Cancer Prevention Trial Risk Calculator',
      description:
        'Estimates risk of prostate cancer and high-grade disease based on PSA levels and other factors',
      url: 'https://riskcalc.org/PCPTRC/',
      organization: 'Fred Hutchinson Cancer Research Center',
      tags: ['prostate cancer', 'PSA', 'risk calculator'],
    },
    {
      id: 'pbcg',
      name: 'PBCG Prostate Cancer Risk Calculator',
      description: 'Incorporates family history, race, and PSA to estimate prostate cancer risk',
      url: 'https://riskcalc.org/PBCG/',
      organization: 'Prostate Biopsy Collaborative Group',
      tags: ['prostate cancer', 'family history', 'risk prediction'],
    },
  ],

  // Lung cancer related risk assessment tools
  lung: [
    {
      id: 'plco',
      name: 'PLCO Lung Cancer Screening Tool',
      description:
        'Helps determine who should get screening based on smoking history and other risk factors',
      url: 'https://www.shouldiscreen.com/lung-cancer-risk-calculator',
      organization: 'National Cancer Institute',
      tags: ['lung cancer', 'smoking', 'screening eligibility'],
    },
  ],

  // Skin cancer related risk assessment tools
  skin: [
    {
      id: 'melanoma-risk',
      name: 'Melanoma Risk Assessment Tool',
      description:
        'Estimates 5-year risk of melanoma based on skin characteristics and sun exposure',
      url: 'https://mrisktool.cancer.gov/',
      organization: 'National Cancer Institute',
      tags: ['melanoma', 'skin cancer', 'sun exposure'],
    },
  ],

  // Diabetes related risk assessment tools
  diabetes: [
    {
      id: 'diabetes-risk',
      name: 'Type 2 Diabetes Risk Test',
      description:
        'Assesses risk for developing type 2 diabetes based on lifestyle and personal factors',
      url: 'https://diabetes.org/risk-test',
      organization: 'American Diabetes Association',
      tags: ['diabetes', 'lifestyle', 'risk factors'],
    },
  ],

  // Heart disease related risk assessment tools
  heart: [
    {
      id: 'ascvd',
      name: 'ASCVD Risk Estimator Plus',
      description:
        'Calculates 10-year risk of heart disease or stroke using the Pooled Cohort Equations',
      url: 'https://tools.acc.org/ascvd-risk-estimator-plus',
      organization: 'American College of Cardiology',
      tags: ['cardiovascular disease', 'heart attack', 'stroke'],
    },
    {
      id: 'framingham',
      name: 'Framingham Heart Study Risk Score',
      description:
        'Predicts 10-year cardiovascular disease risk based on the Framingham Heart Study',
      url: 'https://framinghamheartstudy.org/fhs-risk-functions/cardiovascular-disease-10-year-risk/',
      organization: 'Framingham Heart Study',
      tags: ['heart disease', 'risk score', 'cardiovascular health'],
    },
  ],
};

export const mockResources: { [key: string]: GuidelineResource[] } = {
  // Breast cancer related resources
  breast: [
    {
      id: 'acr-breast',
      title: 'ACR Breast Cancer Screening Guidelines',
      description: 'Detailed screening recommendations from the American College of Radiology',
      url: 'https://www.acr.org/Clinical-Resources/Breast-Imaging-Resources/Breast-Cancer-Screening-Resources',
      source: 'American College of Radiology',
      type: 'professional',
    },
    {
      id: 'susan-komen',
      title: 'Breast Cancer Information for Patients',
      description: 'Educational resources about breast cancer detection, diagnosis, and treatment',
      url: 'https://www.komen.org/breast-cancer/',
      source: 'Susan G. Komen',
      type: 'patient',
    },
    {
      id: 'cdc-breast',
      title: 'Breast Cancer: What You Need to Know',
      description: 'Basic information about breast cancer, screening, and risk factors',
      url: 'https://www.cdc.gov/cancer/breast/basic_info/index.htm',
      source: 'Centers for Disease Control and Prevention',
      type: 'patient',
    },
    {
      id: 'nejm-breast',
      title: 'Breast-Cancer Screening — Viewpoint of the IARC Working Group',
      description: 'Research paper on current evidence for breast cancer screening effectiveness',
      url: 'https://www.nejm.org/doi/full/10.1056/NEJMsr1504363',
      source: 'New England Journal of Medicine',
      type: 'research',
    },
  ],

  // Colorectal cancer related resources
  colorectal: [
    {
      id: 'uspstf-colorectal',
      title: 'USPSTF Colorectal Cancer Screening Recommendations',
      description: 'Evidence-based recommendations for colorectal cancer screening',
      url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening',
      source: 'U.S. Preventive Services Task Force',
      type: 'professional',
    },
    {
      id: 'acs-colorectal',
      title: 'Colorectal Cancer Screening Guidelines',
      description: 'Guidelines for early detection of colorectal cancer and polyps',
      url: 'https://www.cancer.org/cancer/colon-rectal-cancer/detection-diagnosis-staging/acs-recommendations.html',
      source: 'American Cancer Society',
      type: 'professional',
    },
    {
      id: 'cdc-colorectal',
      title: 'Colorectal Cancer Screening Tests',
      description: 'Information about different types of colorectal cancer screening tests',
      url: 'https://www.cdc.gov/cancer/colorectal/basic_info/screening/tests.htm',
      source: 'Centers for Disease Control and Prevention',
      type: 'patient',
    },
    {
      id: 'ccalliance',
      title: 'Screening Information for Patients',
      description: 'Patient-friendly information about colorectal cancer screening options',
      url: 'https://www.ccalliance.org/screening-prevention/screening-methods',
      source: 'Colorectal Cancer Alliance',
      type: 'patient',
    },
  ],

  // Cervical cancer related resources
  cervical: [
    {
      id: 'acog-cervical',
      title: 'ACOG Cervical Cancer Screening Guidelines',
      description: 'Clinical guidance for cervical cancer screening and management',
      url: 'https://www.acog.org/clinical/clinical-guidance/practice-advisory/articles/2021/04/updated-cervical-cancer-screening-guidelines',
      source: 'American College of Obstetricians and Gynecologists',
      type: 'professional',
    },
    {
      id: 'nci-cervical',
      title: 'Cervical Cancer Screening (PDQ®)–Patient Version',
      description: 'Information about cervical cancer screening for patients',
      url: 'https://www.cancer.gov/types/cervical/patient/cervical-screening-pdq',
      source: 'National Cancer Institute',
      type: 'patient',
    },
    {
      id: 'who-cervical',
      title: 'WHO Guidelines for Screening and Treatment of Cervical Pre-Cancer Lesions',
      description: 'Global recommendations for cervical cancer prevention',
      url: 'https://www.who.int/publications/i/item/9789240030824',
      source: 'World Health Organization',
      type: 'research',
    },
  ],

  // Prostate cancer related resources
  prostate: [
    {
      id: 'aua-prostate',
      title: 'AUA PSA Screening Guidelines',
      description: 'Clinical guidelines for prostate cancer screening',
      url: 'https://www.auanet.org/guidelines/guidelines/prostate-cancer-early-detection-guideline',
      source: 'American Urological Association',
      type: 'professional',
    },
    {
      id: 'pcf-screening',
      title: 'Prostate Cancer Screening for Patients',
      description: 'Information about prostate cancer screening options and decision-making',
      url: 'https://www.pcf.org/about-prostate-cancer/screening-early-detection/',
      source: 'Prostate Cancer Foundation',
      type: 'patient',
    },
    {
      id: 'nejm-prostate',
      title: 'Screening for Prostate Cancer: USPSTF Recommendation Statement',
      description: 'Research and evidence for prostate cancer screening recommendations',
      url: 'https://www.nejm.org/doi/full/10.1056/NEJMsr1804988',
      source: 'New England Journal of Medicine',
      type: 'research',
    },
  ],

  // Lung cancer related resources
  lung: [
    {
      id: 'ats-lung',
      title: 'ATS/CHEST Lung Cancer Screening Guidelines',
      description: 'Professional guidelines for lung cancer screening with low-dose CT',
      url: 'https://www.thoracic.org/statements/resources/lcod/lung-cancer-screening.pdf',
      source: 'American Thoracic Society',
      type: 'professional',
    },
    {
      id: 'lungevity',
      title: 'Lung Cancer Screening Information',
      description:
        'Patient-friendly information about lung cancer screening eligibility and process',
      url: 'https://www.lungevity.org/for-patients-caregivers/lung-cancer-101/lung-cancer-screening',
      source: 'LUNGevity Foundation',
      type: 'patient',
    },
  ],

  // Skin cancer related resources
  skin: [
    {
      id: 'aad-skin',
      title: 'AAD Skin Cancer Screening Guidelines',
      description: 'Professional guidelines for skin cancer screening and prevention',
      url: 'https://www.aad.org/public/diseases/skin-cancer/find-skin-cancer-early',
      source: 'American Academy of Dermatology',
      type: 'professional',
    },
    {
      id: 'skincancer-foundation',
      title: 'Skin Cancer Prevention Guidelines',
      description: 'Information for patients about preventing skin cancer and self-examination',
      url: 'https://www.skincancer.org/early-detection/',
      source: 'Skin Cancer Foundation',
      type: 'patient',
    },
  ],

  // Diabetes related resources
  diabetes: [
    {
      id: 'ada-diabetes',
      title: 'ADA Standards of Medical Care in Diabetes',
      description: 'Comprehensive guidelines for diabetes screening and management',
      url: 'https://diabetesjournals.org/care/issue/46/Supplement_1',
      source: 'American Diabetes Association',
      type: 'professional',
    },
    {
      id: 'cdc-diabetes',
      title: 'Diabetes Risk Test and Prevention',
      description: 'Information about diabetes prevention and risk assessment',
      url: 'https://www.cdc.gov/diabetes/prevention/index.html',
      source: 'Centers for Disease Control and Prevention',
      type: 'patient',
    },
  ],

  // Heart disease related resources
  heart: [
    {
      id: 'acc-heart',
      title: 'ACC/AHA Cardiovascular Risk Assessment Guidelines',
      description: 'Clinical practice guidelines for cardiovascular risk assessment',
      url: 'https://www.acc.org/Guidelines/About-Guidelines-and-Clinical-Documents/Guidelines-and-Documents-Search#q=risk%20assessment&sort=relevancy',
      source: 'American College of Cardiology',
      type: 'professional',
    },
    {
      id: 'aha-heart',
      title: 'Heart Disease Risk Factors',
      description: 'Information about heart disease risk factors and prevention',
      url: 'https://www.heart.org/en/health-topics/heart-attack/understand-your-risks-to-prevent-a-heart-attack',
      source: 'American Heart Association',
      type: 'patient',
    },
  ],
};

// Helper function to get tools and resources for a specific guideline
export const getToolsAndResourcesForGuideline = (guidelineId: string) => {
  // Extract category from guideline ID or map IDs to categories
  const categoryMap: { [key: string]: string } = {
    '1': 'colorectal',
    '2': 'breast',
    '3': 'cervical',
    '4': 'prostate',
    '5': 'skin',
    '6': 'heart',
    '7': 'heart',
    '8': 'lung',
    '9': 'diabetes',
  };

  const category = categoryMap[guidelineId] || '';

  return {
    tools: mockRiskTools[category] || [],
    resources: mockResources[category] || [],
  };
};
