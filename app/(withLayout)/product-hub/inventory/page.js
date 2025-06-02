import React, { Suspense } from 'react';
import Loading from '@/app/components/shared/Loading/Loading';
import Inventory from '@/app/components/inventory/Inventory';

const InventoryPage = () => {

  return (
    <Suspense fallback={<Loading />}>
      <Inventory />
    </Suspense>
  );
};

export default InventoryPage;