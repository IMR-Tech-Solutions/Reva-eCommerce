import { ProductData } from "../types/types";

const ProductCard = ({ product }: { product: ProductData }) => {
  return (
    <>
      {product && product.active_stock.quantity === 0 ? (
        <div className=" product-details flex flex-col gap-2 items-start justify-center">
          <div className="absolute inset-0 bg-white/[0.1] dark:bg-white/[0.08] backdrop-blur-sm flex items-center justify-center rounded-xl">
            <span className="text-red-600 font-bold">OUT OF STOCK</span>
          </div>
          <img
            src={`${import.meta.env.VITE_API_IMG_URL}${product.product_image}`}
            className="w-full h-40 object-cover rounded-xl"
          />
          <h2 className="text-sm theme-text-2">{product.product_name}</h2>
          <h2 className="text-sm text-gray-600 theme-text">
            Quantity: {product.active_stock.quantity}
          </h2>
          <h2 className="text-sm theme-text-2 mb-4">
            Price: {product.active_stock.selling_price}
          </h2>
          <button className="text-sm bg-brand-500 text-white w-full py-1 rounded-md hover:bg-brand-700 duration-300">
            Add to Cart
          </button>
        </div>
      ) : (
        <div className="product-details flex flex-col gap-2 items-start justify-center">
          <img
            src={`${product.product_image}`}
            className="w-full h-40 object-cover rounded-xl"
          />
          <h2 className="text-sm theme-text-2">{product.product_name}</h2>
          <h3 className="text-xs theme-text">
            Category: {product.category_name}
          </h3>
          <div className="flex items-center justify-between w-full mb-3">
            <h2 className="text-sm theme-text">
              Quantity: {product.active_stock.quantity}
            </h2>
            <h2 className="text-sm theme-text-2">
              Price: {product.active_stock.selling_price}
            </h2>
          </div>

          <button className="text-sm bg-brand-500 text-white w-full py-1 rounded-md hover:bg-brand-700 duration-300">
            Add to Cart
          </button>
        </div>
      )}
    </>
  );
};

export default ProductCard;
