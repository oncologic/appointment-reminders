import { GuidelineItem } from '../app/components/PersonalizedGuidelines';

export const mockGuidelines: GuidelineItem[] = [
  {
    id: '1',
    name: 'Colorectal Cancer Screening',
    description: 'Screening for colorectal cancer using various testing methods',
    frequency: 'Varies by age',
    ageRanges: [
      {
        min: 45,
        max: 49,
        label: '45-49',
        frequency: 'Every 1-3 years with FIT or other stool-based test',
        frequencyMonths: 12, // Annual minimum
        frequencyMonthsMax: 36, // Up to every 3 years
        notes: 'Starting at age 45 for average risk individuals',
      },
      {
        min: 50,
        max: 75,
        label: '50-75',
        frequency: 'Every 10 years with colonoscopy, or other methods at different intervals',
        frequencyMonths: 12, // Annual for FIT
        frequencyMonthsMax: 120, // Up to 10 years for colonoscopy
        notes: 'High risk individuals may need more frequent screening',
      },
      {
        min: 76,
        max: 85,
        label: '76-85',
        frequency: 'Based on individual health status and screening history',
        frequencyMonths: 12, // Minimum annual for high risk
        frequencyMonthsMax: 120, // Up to 10 years for low risk
        notes: 'Decision should be made with healthcare provider',
      },
    ],
    genders: ['all'],
    category: 'Cancer Screening',
    visibility: 'public',
    createdBy: 'system',
    tags: ['colorectal', 'cancer', 'colonoscopy', 'FIT'],
  },
  {
    id: '2',
    name: 'Breast Cancer Screening',
    description: 'Mammography and clinical breast exams for early detection',
    frequency: 'Varies by age',
    ageRanges: [
      {
        min: 25,
        max: 39,
        label: '25-39',
        frequency: 'Clinical breast exam every 1-3 years',
        frequencyMonths: 12, // Annual minimum
        frequencyMonthsMax: 36, // Up to every 3 years
        notes: 'For women at average risk',
      },
      {
        min: 40,
        max: 44,
        label: '40-44',
        frequency: 'Optional annual mammogram',
        frequencyMonths: 12, // Annual
        notes: 'Consider individual risk factors and preferences',
      },
      {
        min: 45,
        max: 54,
        label: '45-54',
        frequency: 'Annual mammogram recommended',
        frequencyMonths: 12, // Annual
        notes: 'More frequent screening for high-risk individuals',
      },
      {
        min: 55,
        max: 74,
        label: '55-74',
        frequency: 'Mammogram every 1-2 years',
        frequencyMonths: 12, // Annual minimum
        frequencyMonthsMax: 24, // Up to every 2 years
        notes: 'Based on individual preferences and risk factors',
      },
      {
        min: 75,
        max: null,
        label: '75+',
        frequency: 'Based on overall health and life expectancy',
        frequencyMonths: 12, // Annual minimum if continuing screening
        frequencyMonthsMax: 24, // Up to every 2 years
        notes: 'Consult with healthcare provider',
      },
    ],
    genders: ['female'],
    category: 'Cancer Screening',
    visibility: 'public',
    createdBy: 'system',
    tags: ['breast', 'cancer', 'mammogram'],
  },
  {
    id: '3',
    name: 'Cervical Cancer Screening (Pap test)',
    description: 'Screening test for cervical cancer and HPV',
    frequency: 'Varies by age',
    ageRanges: [
      {
        min: 21,
        max: 29,
        label: '21-29',
        frequency: 'Every 3 years with Pap test alone',
        frequencyMonths: 36, // Every 3 years
        notes: 'HPV testing not recommended in this age group',
      },
      {
        min: 30,
        max: 65,
        label: '30-65',
        frequency:
          'Every 5 years with HPV and Pap co-testing, or every 3 years with Pap test alone',
        frequencyMonths: 36, // Every 3 years minimum with Pap alone
        frequencyMonthsMax: 60, // Up to every 5 years with co-testing
        notes: 'HPV testing alone every 5 years is also an option',
      },
      {
        min: 66,
        max: null,
        label: '66+',
        frequency: 'No screening needed after adequate prior screening',
        notes: 'If history of normal results and no high risk factors',
      },
    ],
    genders: ['female'],
    category: 'Cancer Screening',
    visibility: 'public',
    createdBy: 'system',
    tags: ['cervical', 'cancer', 'pap', 'HPV'],
  },
  {
    id: '4',
    name: 'Prostate Cancer Screening',
    description: 'PSA blood test and digital rectal exam',
    frequency: 'Varies by age and risk factors',
    ageRanges: [
      {
        min: 40,
        max: 44,
        label: '40-44',
        frequency: 'Consider baseline screening for high-risk men',
        frequencyMonths: 12, // Annual for high-risk
        notes: 'Including African American men and those with family history',
      },
      {
        min: 45,
        max: 49,
        label: '45-49',
        frequency: 'Consider screening for high-risk men',
        frequencyMonths: 12, // Annual for high-risk
        notes: 'Discuss benefits and risks with healthcare provider',
      },
      {
        min: 50,
        max: 69,
        label: '50-69',
        frequency: 'Consider screening every 1-2 years',
        frequencyMonths: 12, // Annual minimum
        frequencyMonthsMax: 24, // Up to every 2 years
        notes: 'Based on PSA levels and individual risk assessment',
      },
      {
        min: 70,
        max: null,
        label: '70+',
        frequency: 'Individualized decision based on health status',
        frequencyMonths: 24, // Every 2 years if continuing screening
        notes: 'Limited benefit for men with less than 10-15 year life expectancy',
      },
    ],
    genders: ['male'],
    category: 'Cancer Screening',
    visibility: 'public',
    createdBy: 'system',
    tags: ['prostate', 'cancer', 'PSA'],
  },
  {
    id: '5',
    name: 'Skin Cancer Screening',
    description: 'Full body skin examination',
    frequency: 'Annual',
    frequencyMonths: 12, // Annual
    ageRanges: [{ min: 20, max: null, label: '20+' }],
    genders: ['all'],
    category: 'Cancer Screening',
    visibility: 'public',
    createdBy: 'system',
    tags: ['skin', 'cancer', 'melanoma'],
  },
  {
    id: '6',
    name: 'Cholesterol Screening',
    description: 'Lipid profile to check cholesterol levels',
    frequency: 'Varies by age and risk factors',
    ageRanges: [
      {
        min: 20,
        max: 39,
        label: '20-39',
        frequency: 'Every 4-6 years for those at average risk',
        frequencyMonths: 48, // Every 4 years minimum
        frequencyMonthsMax: 72, // Up to every 6 years
        notes: 'More frequent for those with cardiovascular risk factors',
      },
      {
        min: 40,
        max: 75,
        label: '40-75',
        frequency: 'Every 1-2 years',
        frequencyMonths: 12, // Annual minimum
        frequencyMonthsMax: 24, // Up to every 2 years
        notes: 'May be more frequent based on risk factors and previous results',
      },
      {
        min: 76,
        max: null,
        label: '76+',
        frequency: 'Individualized based on health status',
        frequencyMonths: 12, // Annual minimum if continuing screening
        frequencyMonthsMax: 24, // Up to every 2 years
        notes: 'Discuss with healthcare provider',
      },
    ],
    genders: ['all'],
    category: 'Cardiovascular Health',
    visibility: 'public',
    createdBy: 'system',
    tags: ['heart', 'cholesterol', 'lipids'],
  },
  {
    id: '7',
    name: 'Blood Pressure Screening',
    description: 'Measurement of blood pressure',
    frequency: 'Annual, or more frequently based on readings',
    frequencyMonths: 12, // Annual minimum
    ageRanges: [{ min: 18, max: null, label: '18+' }],
    genders: ['all'],
    category: 'Cardiovascular Health',
    visibility: 'public',
    createdBy: 'system',
    tags: ['heart', 'hypertension', 'blood pressure'],
  },
  {
    id: '8',
    name: 'Lung Cancer Screening',
    description: 'Low-dose CT scan',
    frequency: 'Annual',
    frequencyMonths: 12, // Annual
    ageRanges: [
      {
        min: 50,
        max: 80,
        label: '50-80',
        frequency: 'Annual for current smokers or those who quit within past 15 years',
        frequencyMonths: 12, // Annual
        notes: 'With at least a 20 pack-year smoking history',
      },
    ],
    genders: ['all'],
    category: 'Cancer Screening',
    visibility: 'public',
    createdBy: 'system',
    tags: ['lung', 'cancer', 'smoking'],
  },
  {
    id: '9',
    name: 'Diabetes Screening',
    description: 'Blood tests to measure glucose levels',
    frequency: 'Every 3 years, more frequently with risk factors',
    frequencyMonths: 12, // Annual minimum with risk factors
    frequencyMonthsMax: 36, // Up to every 3 years for normal weight
    ageRanges: [
      {
        min: 35,
        max: 70,
        label: '35-70',
        frequency: 'Every 3 years for those with normal weight',
        frequencyMonths: 12, // Annual minimum with risk factors
        frequencyMonthsMax: 36, // Up to every 3 years
        notes: 'More frequently with overweight/obesity or other risk factors',
      },
    ],
    genders: ['all'],
    category: 'Metabolic Health',
    visibility: 'public',
    createdBy: 'system',
    tags: ['diabetes', 'glucose', 'A1C'],
  },
];

export default mockGuidelines;
