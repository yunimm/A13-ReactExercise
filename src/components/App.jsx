import React, { useCallback } from 'react';
import ProductItem from './ProductItem';
import { PRODUCTS } from './config';
import Cart from './Cart';
import Coupons from './Coupons';
import type { LineItem, Product, Coupon } from './types';

// 設置購物車元件
const ShoppingCart = () => {
  // TODO 2，紀錄總金額變數和更新總金額function
  const [totalAmount, setTotalAmount] = React.useState(0);
  /**
   * @type {[LineItem[], Function]}
   */
  // 紀錄購物車商品資料和更新購物車商品資料function
  const [lineItems, setLineItems] = React.useState([]);
  /**
   * @type {[Product[], Function]}
   */
  // 紀錄架上商品資料和更新架上商品資料function
  const [products, setProducts] = React.useState(PRODUCTS);
  /**
   * @type {[Coupon[], Function]}
   */
  // TODO 6，計算總金額，當lineItems有變化，更新總金額
  React.useEffect(() => {
    const calcTotalAmount = lineItems.reduce((total, currentItem) => {
      return total + currentItem.price * currentItem.quantity;
    }, 0);
    setTotalAmount(calcTotalAmount);
  }, [lineItems]);

  const atDecreaseInventory = useCallback((id: string) => {
    // 減少架上商品庫存量
    setProducts((prev) => {
      return prev.map((item: Product) => {
        if (item.id === id) {
          return {
            id: item.id,
            img: item.img,
            title: item.title,
            price: item.price,
            inventory: item.inventory > 0 ? item.inventory - 1 : item.inventory,
          };
        }
        return item;
      });
    });
  }, []);
  const atIncreaseInventory = useCallback((id: string) => {
    // 增加架上商品庫存量
    setProducts((prev) => {
      return prev.map((item: Product) => {
        if (item.id === id) {
          return {
            id: item.id,
            img: item.img,
            title: item.title,
            price: item.price,
            inventory: item.inventory + 1,
          };
        }
        return item;
      });
    });
  }, []);

  // TODO 5增加數量
  const atUpdateQuantity = useCallback((id: string) => {
    // 使用更新購物車商品資料function，以map方式對陣列資料進行加工並回傳新陣列
    setLineItems((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          atDecreaseInventory(id);
          return {
            id: item.id,
            title: item.title,
            price: item.price,
            inventory: item.inventory,
            quantity: item.quantity < item.inventory ? item.quantity + 1 : item.quantity,
          };
        }
        return item;
      });
    });
  }, []);
  // 減少數量
  const atDecreaseQuantity = useCallback((id: string) => {
    // 使用更新購物車商品資料function，以map方式對陣列資料進行加工並回傳新陣列
    setLineItems((prev) => {
      return prev.map((item: LineItem) => {
        if (item.id === id) {
          atIncreaseInventory(id);
          return {
            id: item.id,
            title: item.title,
            price: item.price,
            inventory: item.inventory,
            quantity: item.quantity > 0 ? item.quantity - 1 : item.quantity,
          };
        }
        return item;
      });
    });
  }, []);

  // TODO 5，加入購物車
  const atAddToCart = useCallback(
    (id: string) => {
      // 使用find尋找id相同的資料，回傳物件
      const foundItem = lineItems.find((data) => data.id === id);
      // 如果找到資料，更新數量
      if (foundItem) {
        atUpdateQuantity(id);
      } else {
        // 如果沒有找到，新增一筆新資料
        const foundProduct = PRODUCTS.find((data) => data.id === id);

        const lineItem = {
          id,
          price: foundProduct.price,
          title: foundProduct.title,
          inventory: foundProduct.inventory,
          quantity: 1,
        };
        setLineItems((prev) => prev.concat(lineItem));
        atDecreaseInventory(id);
      }
    },
    [atUpdateQuantity, lineItems],
  );

  // TODO，使用useCallback包住setLineItems func，避免產生不必要的instance
  const onRemoveItem = useCallback((id: string) => {
    // 移除單筆商品
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // TODO，使用useCallback包住setLineItems func，避免產生不必要的instance
  const onRemoveCart = useCallback(() => {
    // 清除全部商品
    setLineItems([]);
  }, []);

  // FIXME 請實作 coupon
  const atApplyCoupon = useCallback(
    (discount: number) => {
      const calcTotalAmount = lineItems.reduce((total, currentItem) => {
        return total + currentItem.price * currentItem.quantity;
      }, 0);
      setTotalAmount(calcTotalAmount - discount);
    },
    [lineItems],
  );

  return (
    <div className="container">
      <div className="row">
        {products.map((product) => {
          return (
            <div className="col-3" key={product.id}>
              <ProductItem
                id={product.id}
                img={product.img}
                title={product.title}
                price={product.price}
                inventory={product.inventory}
                onAddToCart={atAddToCart}
              />
            </div>
          );
        })}
      </div>
      <Cart
        totalAmount={totalAmount}
        lineItems={lineItems}
        onRemoveCart={onRemoveCart}
        onUpdateQuantity={atUpdateQuantity}
        onDecreaseQuantity={atDecreaseQuantity}
        onRemoveItem={onRemoveItem}
      />
      {/* FIXME 請實作 coupon 功能 */}
      <Coupons onApplyCoupon={atApplyCoupon} />
    </div>
  );
};

export default ShoppingCart;
