import { Accordion, AccordionItem } from '@nextui-org/react';
import Link from 'next/link';
import React from 'react';

const ExpenseCard = ({ expenseCategoryList, isOwner }) => {

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {expenseCategoryList?.map((category, idx) => (
        <div key={idx} className="p-6 border-none bg-white drop-shadow rounded-lg">

          <h2 className="font-bold text-lg">
            <Link
              href={`/finances/expense-entries/${encodeURIComponent(category._id)}`}
              className="text-blue-500 hover:underline">
              {category.expenseCategory}
            </Link>
          </h2>

          <div className="text-sm text-neutral-600">

            {/* If no sub-categories → just show category */}
            {category.subCategories?.length > 0 ? (
              <>
                {/* If at least one sub-category has sub-sub-categories → use Accordion */}
                {category.subCategories.some(
                  (sub) => sub.subSubCategories?.length > 0
                ) ? (
                  <Accordion className="flex flex-col w-full p-0"
                    showDivider={true}
                    motionProps={{
                      variants: {
                        enter: { y: 0, opacity: 1, height: "auto", transition: { duration: 0.5 } },
                        exit: { y: -10, opacity: 0, height: 0, transition: { duration: 0.3 } },
                      },
                    }} selectionMode="multiple"
                  >
                    {category.subCategories.map((sub, subIdx) => (
                      <AccordionItem
                        key={`${idx}-${subIdx}`}
                        aria-label={sub.name}
                        title={sub.name}
                        className='pb-0'
                      >
                        {sub.subSubCategories?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {sub.subSubCategories.map((subSub, subSubIdx) => (
                              <span
                                key={subSubIdx}
                                className="px-2 py-1 bg-neutral-100 text-xs rounded-full text-neutral-600"
                              >
                                {subSub}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="italic text-neutral-400 text-sm">
                            No Sub-Sub-Categories
                          </p>
                        )}
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  // If sub-categories but no sub-sub-categories → flat list
                  <div className="flex flex-col gap-3 w-full pt-5">
                    {category.subCategories.map((sub, subIdx) => (
                      <p key={`${idx}-${subIdx}`} className='text-neutral-950 font-medium text-base'>{sub.name}</p>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="italic text-neutral-400 pt-4">No Sub-Categories</p>
            )}
          </div>

        </div>
      ))}
    </div>
  );
};

export default ExpenseCard;