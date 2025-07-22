export interface CompanyTemplate {
  id: string;
  name: string;
  recipientDetails: {
    name: string;
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    gstNumber: string;
  };
  billDetails: {
    rentedArea: string;
    rentRate: string;
    sgstRate: string;
    cgstRate: string;
  };
  defaultRefNumberPrefix: string;
}

export const companyTemplates: CompanyTemplate[] = [
  {
    id: 'company1',
    name: 'Company 1 - Rackup',
    recipientDetails: {
      name: 'Rackup',
      addressLine1: 'Plot No 552, Chandani Warehouse',
      addressLine2: 'Village Parvar Poorab, Sarojini Nagar,',
      addressLine3: 'Lucknow, Uttar Pradesh 226008',
      gstNumber: '09CVWPG8839A2Z0'
    },
    billDetails: {
      rentedArea: '26500',
      rentRate: '18',
      sgstRate: '9',
      cgstRate: '9'
    },
    defaultRefNumberPrefix: 'SWC/25-26'
  },
  {
    id: 'company2',
    name: 'Company 2 - TechCorp',
    recipientDetails: {
      name: 'TechCorp Solutions Pvt Ltd',
      addressLine1: 'Building A-15, Tech Park',
      addressLine2: 'Sector 62, Noida,',
      addressLine3: 'Uttar Pradesh 201301',
      gstNumber: '09AABCT1234C1Z5'
    },
    billDetails: {
      rentedArea: '18000',
      rentRate: '22',
      sgstRate: '9',
      cgstRate: '9'
    },
    defaultRefNumberPrefix: 'TC/25-26'
  },
  {
    id: 'company3',
    name: 'Company 3 - InnovateLab',
    recipientDetails: {
      name: 'InnovateLab Industries',
      addressLine1: 'Plot 44-B, Industrial Area',
      addressLine2: 'Phase-II, Gurgaon,',
      addressLine3: 'Haryana 122016',
      gstNumber: '06BBCIL9876H1Z2'
    },
    billDetails: {
      rentedArea: '35000',
      rentRate: '15',
      sgstRate: '9',
      cgstRate: '9'
    },
    defaultRefNumberPrefix: 'IL/25-26'
  },
  {
    id: 'company4',
    name: 'Company 4 - GlobalTrade',
    recipientDetails: {
      name: 'GlobalTrade Enterprises',
      addressLine1: 'Warehouse Complex 7',
      addressLine2: 'MIDC Area, Pune,',
      addressLine3: 'Maharashtra 411019',
      gstNumber: '27AADCG5432B1ZF'
    },
    billDetails: {
      rentedArea: '42000',
      rentRate: '20',
      sgstRate: '9',
      cgstRate: '9'
    },
    defaultRefNumberPrefix: 'GT/25-26'
  },
  {
    id: 'company5',
    name: 'Company 5 - FastLogistics',
    recipientDetails: {
      name: 'FastLogistics Ltd',
      addressLine1: 'Logistic Hub 12, NH-8',
      addressLine2: 'Manesar Industrial Area,',
      addressLine3: 'Haryana 122051',
      gstNumber: '06CCAFL7890D1ZG'
    },
    billDetails: {
      rentedArea: '28000',
      rentRate: '19',
      sgstRate: '9',
      cgstRate: '9'
    },
    defaultRefNumberPrefix: 'FL/25-26'
  }
];

// Helper function to get template by ID
export const getTemplateById = (id: string): CompanyTemplate | undefined => {
  return companyTemplates.find(template => template.id === id);
};

// Helper function to get all template names for dropdown
export const getTemplateOptions = () => {
  return companyTemplates.map(template => ({
    value: template.id,
    label: template.name
  }));
};
