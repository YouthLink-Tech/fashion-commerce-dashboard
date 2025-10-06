"use client";
import React from 'react';
import ExpenseActions from './ExpenseActions';
import { useAuth } from '@/app/contexts/auth';
import Loading from '../../shared/Loading/Loading';
import useExpenseCategories from '@/app/hooks/useExpenseCategories';
import ExpenseCard from './ExpenseCard';

const currentModule = "Finances";

const Expenses = () => {

  const [expenseCategoryList, isExpenseCategoryPending] = useExpenseCategories();
  const { existingUserData, isUserLoading } = useAuth();
  const permissions = existingUserData?.permissions || [];
  const role = permissions?.find(
    (group) => group.modules?.[currentModule]?.access === true
  )?.role;
  const isAuthorized = role === "Owner" || role === "Editor";

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