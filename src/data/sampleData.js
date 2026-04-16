export const categoryData = [
  {
    id: 'valuable',
    name: 'Valuable',
    percentage: 81,
    total: 21,
    green: 17,
    amber: 0,
    red: 0,
    gray: 4
  },
  {
    id: 'consumable',
    name: 'Consumable',
    percentage: 32,
    total: 105,
    green: 34,
    amber: 28,
    red: 30,
    gray: 13
  },
  {
    id: 'instrumented',
    name: 'Instrumented',
    percentage: 39,
    total: 84,
    green: 33,
    amber: 22,
    red: 21,
    gray: 8
  },
  {
    id: 'platform-enabled',
    name: 'Platform-Enabled',
    percentage: 14,
    total: 21,
    green: 3,
    amber: 10,
    red: 8,
    gray: 0
  }
];

export const productData = [
  {
    category: 'Data',
    products: [
      {
        name: 'watsonx Orchestrate',
        columns: ['green', 'green', 'red', 'red', 'green', 'red', 'green', 'green']
      },
      {
        name: 'Project Bob',
        columns: ['green', 'Pending GA', 'Pending GA', 'Pending GA', 'N/A', 'N/A', 'amber-Mar\'26', 'amber-Q2\'26']
      },
      {
        name: 'watsonx.gov',
        columns: ['green', 'green', 'amber', 'amber', 'amber', 'amber', 'green', 'amber-Q2\'26']
      },
      {
        name: 'Guardium Data Security Center',
        columns: ['green', 'Pending NPI', 'amber', 'amber', 'Pending NPI', 'Pending NPI', 'green', 'amber-Mar\'26']
      },
      {
        name: 'watsonx.data',
        columns: ['green', 'green', 'amber', 'amber', 'green', 'red', 'green', 'green']
      }
    ]
  },
  {
    category: 'Automation',
    products: [
      {
        name: 'Terraform',
        columns: ['green', 'green', 'green', 'amber', 'green', 'red', 'amber', 'amber']
      },
      {
        name: 'Instana',
        columns: ['green', 'green', 'amber', 'amber', 'amber', 'red', 'green', 'green', 'green']
      },
      {
        name: 'Concert',
        columns: ['green', 'green', 'green', 'amber', 'green', 'amber', 'green', 'green', 'green']
      },
      {
        name: 'Kubecost',
        columns: ['green', 'green', 'green', 'amber', 'green', 'red', 'amber-Mar\'26', 'N/A', 'amber']
      },
      {
        name: 'Cloudability',
        columns: ['green', 'green', 'amber', 'amber', 'green', 'red', 'amber-Mar\'26', 'N/A', 'amber']
      }
    ]
  }
];

export const analyticsData = {
  totalProducts: 21,
  complete: 87,
  completeTotal: 231,
  inProgress: 60,
  inProgressTotal: 231,
  atRisk: 59,
  atRiskTotal: 231,
  na: 25,
  naTotal: 231
};

export const chartData = [
  {
    group: 'Q1 2026',
    complete: 70,
    inProgress: 30,
    atRisk: 20,
    na: 10
  },
  {
    group: 'Q2 2026',
    complete: 87,
    inProgress: 60,
    atRisk: 59,
    na: 25
  }
];

// Made with Bob
