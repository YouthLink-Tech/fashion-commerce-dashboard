"use client";
import Loading from "@/app/components/shared/Loading/Loading";
import useProductsInformation from "@/app/hooks/useProductsInformation";
import Image from "next/image";
import { useRouter } from "next/navigation";
import arrowSvgImage from "/public/card-images/arrow.svg";
import arrivals1 from "/public/card-images/arrivals1.svg";
import arrivals2 from "/public/card-images/arrivals2.svg";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";
import useCategories from "@/app/hooks/useCategories";
import { useEffect, useState } from "react";
import useSeasons from "@/app/hooks/useSeasons";
import { useUserPermissions } from "@/app/hooks/useUserPermissions";

const currentModule = "Product Hub";

const EditProduct = () => {

  const [categoryList, isCategoryPending] = useCategories();
  const [productList, isProductPending] = useProductsInformation();
  const [seasonList, isSeasonPending] = useSeasons();
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('category');
  const { isUserLoading, isAuthorizedForModule } = useUserPermissions();
  const isAuthorized = isAuthorizedForModule(currentModule);

  // Scroll event listener to track when to add background color
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleGoToCategoryPage = (categoryName) => {
    router.push(`/product-hub/products/existing-products/${categoryName}`);
  };

  const handleGoToSeasonPage = (seasonName) => {
    router.push(`/product-hub/products/existing-products/seasons/${seasonName}`);
  };

  // Ensure the code runs only on the client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('activeTabExistingProductPage');
      if (savedTab) {
        setActiveTab(savedTab);
      }
    }
  }, []);

  // Save the activeTab to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeTabExistingProductPage', activeTab);
    }
  }, [activeTab]);

  if (isProductPending || isCategoryPending || isSeasonPending || isUserLoading) {
    return <Loading />
  }

  return (
    <div className='relative w-full min-h-[calc(100vh-60px)] bg-gray-50'>
      <div
        style={{
          backgroundImage: `url(${arrivals1.src})`,
        }}
        className='absolute inset-0 z-0 hidden md:block bg-no-repeat left-[45%] lg:left-[60%] -top-[138px]'
      />
      <div
        style={{
          backgroundImage: `url(${arrivals2.src})`,
        }}
        className='absolute inset-0 z-0 bg-contain bg-center xl:-top-28 w-full bg-no-repeat'
      />
      <div
        style={{
          backgroundImage: `url(${arrowSvgImage.src})`,
        }}
        className='absolute inset-0 z-0 top-2 md:top-0 bg-[length:60px_30px] md:bg-[length:100px_50px] left-[60%] lg:bg-[length:200px_100px] md:left-[38%] lg:left-[48%] 2xl:left-[40%] bg-no-repeat'
      />

      <div className={`mx-auto transition-colors duration-1000 sticky top-0 px-6 py-2 md:px-6 md:py-6 z-10 bg-gray-50 flex justify-between gap-4 ${isScrolled ? "bg-gray-50 py-3" : "bg-transparent py-3 md:py-6"
        }`}>
        <div className="flex items-center gap-3 w-full">

          <button
            className={`relative py-1 transition-all duration-300
${activeTab === 'category' ? 'text-neutral-800 font-semibold' : 'text-neutral-400 font-medium'}
after:absolute after:left-0 after:right-0 hover:text-neutral-800 after:bottom-0 
after:h-[2px] after:bg-neutral-800 after:transition-all after:duration-300
${activeTab === 'category' ? 'after:w-full font-bold' : 'after:w-0 hover:after:w-full'}
`}
            onClick={() => setActiveTab('category')}
          >
            Category
          </button>

          <button
            className={`relative py-1 transition-all duration-300
${activeTab === 'collection' ? 'text-neutral-800 font-semibold' : 'text-neutral-400 font-medium'}
after:absolute after:left-0 after:right-0 after:bottom-0 
after:h-[2px] after:bg-neutral-800 hover:text-neutral-800 after:transition-all after:duration-300
${activeTab === 'collection' ? 'after:w-full' : 'after:w-0 hover:after:w-full'}
`}
            onClick={() => setActiveTab('collection')}
          >
            Collection
          </button>

        </div>

        {
          isAuthorized &&
          <Link className='flex items-center gap-2 text-[10px] md:text-base justify-end w-full' href={`/product-hub/products`}> <span className='border border-black rounded-full p-1 md:p-2 hover:scale-105 duration-300'><FaArrowLeft /></span> Go Back</Link>
        }

      </div>

      {activeTab === "category" && <div>
        <h3 className='w-full font-semibold text-lg md:text-xl lg:text-3xl text-neutral-700 mx-auto px-6 pb-6'>Look at Our Categories</h3>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mx-auto px-6">
          {categoryList?.map((category, index) => {
            // Filter products that match the current category
            const productCount = productList?.filter(product => product?.category === category?.label).length;

            return (
              <div key={index} className="w-full h-48 2xl:h-60 relative group cursor-pointer hover:scale-105 transition-all duration-300 rounded-lg border" onClick={() => handleGoToCategoryPage(category?.label)}>
                {/* Image */}
                <Image
                  className="object-cover rounded-lg"
                  src={category?.imageUrl === "" ? "https://storage.googleapis.com/fashion-commerce-pdf/1748156497021_shopping.png" : category?.imageUrl}
                  alt={`${category?.label} - Explore products in the ${category?.label} category`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  quality={100}
                  priority={index < 6}
                />

                {/* Category Label - Always visible */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-[10px] md:text-base font-semibold bg-black bg-opacity-50 md:px-4 md:py-2 px-2 py-1 rounded">
                    {category?.label}
                  </h3>
                </div>

                {/* Product Count - Hidden initially, appears on hover with animation */}
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                  <h4 className="text-white text-sm md:text-lg font-semibold">
                    {productCount} Products
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>}

      {activeTab === "collection" && <div>
        <h3 className='w-full font-semibold text-lg md:text-xl lg:text-3xl text-neutral-700 mx-auto px-6 pb-6'>Look at Our Seasonal Collection</h3>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mx-auto px-6">
          {seasonList?.map((season, index) => {
            // Filter products that match the current season
            const productCount = productList?.filter(product =>
              product?.season?.includes(season?.seasonName) // Ensure this checks for inclusion in an array
            ).length || 0;

            return (
              <div key={index} className="w-full h-48 2xl:h-60 relative group cursor-pointer hover:scale-105 transition-all duration-300 rounded-lg border" onClick={() => handleGoToSeasonPage(season?.seasonName)}>

                {/* Image */}
                <Image
                  className="object-contain rounded-lg px-1.5"
                  src={season?.imageUrl === null ? "https://storage.googleapis.com/fashion-commerce-pdf/1748156497021_shopping.png" : season?.imageUrl}
                  alt={`${season?.seasonName} – Discover products for the ${season?.seasonName} season`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  quality={100}
                  priority={index < 6}
                />

                {/* Category Label - Always visible */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-[10px] md:text-base font-semibold bg-black bg-opacity-50 md:px-4 md:py-2 px-2 py-1 rounded">
                    {season?.seasonName}
                  </h3>
                </div>

                {/* Product Count - Hidden initially, appears on hover with animation */}
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                  <h4 className="text-white text-sm md:text-lg font-semibold">
                    {productCount} Products
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>}

    </div>
  );
};

export default EditProduct;