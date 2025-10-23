"use client";
import React from 'react';
import ExpenseActions from './ExpenseActions';
import Loading from '../../shared/Loading/Loading';
import useExpenseCategories from '@/app/hooks/useExpenseCategories';
import ExpenseCard from './ExpenseCard';
import { useUserPermissions } from '@/app/hooks/useUserPermissions';

const currentModule = "Finances";

const Expenses = () => {

  const [expenseCategoryList, isExpenseCategoryPending] = useExpenseCategories();
  const { isUserLoading, isAuthorizedForModule } = useUserPermissions();
  const isAuthorized = isAuthorizedForModule(currentModule);

  if (isUserLoading || isExpenseCategoryPending) return <Loading />;

  return (
    <div className="space-y-5 relative">

      {isAuthorized &&
        <ExpenseActions />
      }

      <ExpenseCard
        expenseCategoryList={expenseCategoryList}
      />

    </div>
  );
};

export default Expenses;