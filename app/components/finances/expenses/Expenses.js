import React from 'react';
import ExpenseActions from './ExpenseActions';
import { useAuth } from '@/app/contexts/auth';
import Loading from '../../shared/Loading/Loading';
import useExpenseCategories from '@/app/hooks/useExpenseCategories';

const currentModule = "Finances";

const Expenses = () => {

  const [expenseCategoryList, isExpenseCategoryPending] = useExpenseCategories();
  const { existingUserData, isUserLoading } = useAuth();
  const permissions = existingUserData?.permissions || [];
  const role = permissions?.find(
    (group) => group.modules?.[currentModule]?.access === true
  )?.role;
  const isAuthorized = role === "Owner" || role === "Editor";
  const isOwner = role === "Owner";

  if (isUserLoading || isExpenseCategoryPending) return <Loading />;

  console.log(expenseCategoryList, "expenseCategoryList");

  return (
    <div className="space-y-5 relative">

      {isAuthorized &&
        <ExpenseActions />
      }

    </div>
  );
};

export default Expenses;