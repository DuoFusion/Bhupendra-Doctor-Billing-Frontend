export type DashboardStats = {
  bills: number;
  paidBills: number;
  dueBills: number;
  paidAmount: number;
  dueAmount: number;
  financials: number;
  incomeCount: number;
  expenseCount: number;
  financialAmount: number;
  incomeAmount: number;
  expenseAmount: number;
  products: number;
  companies: number;
  categories: number;
  users: number;
};

export type DashboardStatsResponse = {
  status: boolean;
  message: string;
  stats: DashboardStats;
};
