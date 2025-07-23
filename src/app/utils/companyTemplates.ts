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
    name: 'Company 1 - Value Logistics 1',
    recipientDetails: {
      name: 'Value Logistics',
      addressLine1: '1st Floor, Shop NO. 1, Tyagi Complex,',
      addressLine2: 'Opposite DPS School, Meerut Road,',
      addressLine3: 'Distt.-Ghaziabad, U.P.',
      gstNumber: '09APAPK2219Q2ZL'
    },
    billDetails: {
      rentedArea: '25000',
      rentRate: '18',
      sgstRate: '9',
      cgstRate: '9'
    },
    defaultRefNumberPrefix: 'VL1/25-26'
  },
  {
    id: 'company2',
    name: 'Company 2 - Value Logistics 2',
    recipientDetails: {
      name: 'Value Logistics',
      addressLine1: '1st Floor, Shop NO. 1, Tyagi Complex,',
      addressLine2: 'Opposite DPS School, Meerut Road,',
      addressLine3: 'Distt.-Ghaziabad, U.P.',
      gstNumber: 'APAPK2219Q'
    },
    billDetails: {
      rentedArea: '25000',
      rentRate: '18',
      sgstRate: '9',
      cgstRate: '9'
    },
    defaultRefNumberPrefix: 'VL2/25-26'
  },
  {
    id: 'company3',
    name: 'Company 3 - Ulink Agritech',
    recipientDetails: {
      name: 'Ulink Agritech Pvt Ltd',
      addressLine1: 'Plot No 562, Bhandari Farm',
      addressLine2: 'Village Natkur, Sarojini Nagar,',
      addressLine3: 'Lucknow, Uttar Pradesh 226008',
      gstNumber: '09AABCU0395G1Z9'
    },
    billDetails: {
      rentedArea: '28000',
      rentRate: '16',
      sgstRate: '9',
      cgstRate: '9'
    },
    defaultRefNumberPrefix: 'UA/25-26'
  },
  {
    id: 'company4',
    name: 'Company 4 - Cmunity Innovation 1',
    recipientDetails: {
      name: 'Cmunity Innovation Pvt Ltd',
      addressLine1: 'Plot No 562, Bhandari Farm',
      addressLine2: 'Village Natkur, Sarojini Nagar,',
      addressLine3: 'Lucknow, Uttar Pradesh 226008',
      gstNumber: '09AAGICC7028B1ZU'
    },
    billDetails: {
      rentedArea: '6000',
      rentRate: '19',
      sgstRate: '9',
      cgstRate: '9'
    },
    defaultRefNumberPrefix: 'CI1/25-26'
  },
  {
    id: 'company5',
    name: 'Company 5 - Cmunity Innovation 2',
    recipientDetails: {
      name: 'Cmunity Innovation Pvt Ltd',
      addressLine1: 'Plot No 562, Bhandari Farm',
      addressLine2: 'Village Natkur, Sarojini Nagar,',
      addressLine3: 'Lucknow, Uttar Pradesh 226008',
      gstNumber: '09AAGICC7028B1ZU'
    },
    billDetails: {
      rentedArea: '63500',
      rentRate: '19',
      sgstRate: '9',
      cgstRate: '9'
    },
    defaultRefNumberPrefix: 'CI2/25-26'
  },
  {
    id: 'company6',
    name: 'Company 6 - Kapoor Diesels Garage',
    recipientDetails: {
      name: 'Kapoor Diesels Garage Private Limited',
      addressLine1: 'Plot No 552, Chandani Warehouse',
      addressLine2: 'Village Parvar Poorab, Sarojini Nagar,',
      addressLine3: 'Lucknow, Uttar Pradesh 226008',
      gstNumber: '09AAACK9286G1ZL'
    },
    billDetails: {
      rentedArea: '24000',
      rentRate: '14.50',
      sgstRate: '9',
      cgstRate: '9'
    },
    defaultRefNumberPrefix: 'KDG/25-26'
  },
  {
    id: 'company7',
    name: 'Company 7 - Kapoor Diesels Garage 2',
    recipientDetails: {
      name: 'Kapoor Diesels Garage Private Limited',
      addressLine1: 'Plot No 552, Chandani Warehouse',
      addressLine2: 'Village Parvar Poorab, Sarojini Nagar,',
      addressLine3: 'Lucknow, Uttar Pradesh 226008',
      gstNumber: '09AAACK9286G1ZL'
    },
    billDetails: {
      rentedArea: '30000',
      rentRate: '14.50',
      sgstRate: '9',
      cgstRate: '9'
    },
    defaultRefNumberPrefix: 'KDG2/25-26'
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
