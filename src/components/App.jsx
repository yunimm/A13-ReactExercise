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

  // TODO 5 增加數量
  const atUpdateQuantity = useCallback((id: string) => {
    const foundProduct = products.find((item) => item.id === id);
    // 檢查它的庫存量，如果是 0 的話就結束這個函示，不用再往下執行
    if (!foundProduct.inventory) return;
    setLineItems((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          return {
            id: item.id,
            title: item.title,
            price: item.price,
            inventory: item.inventory,
            quantity: item.quantity + 1,
          };
        }
        return item;
      });
    });

    setProducts((prev) => {
      return prev.map((item: Product) => {
        if (item.id === id) {
          return {
            id: item.id,
            img: item.img,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            inventory: item.inventory - 1,
          };
        }
        return item;
      });
    });
  }, []);
  // 減少數量
  const atDecreaseQuantity = useCallback((id: string) => {
    // 先比對 id 找出要更新的那一筆
    const foundProduct = products.find((item) => item.id === id);
    // 檢查它的庫存量，如果是 0 的話就結束這個函示，不用再往下執行
    if (!foundProduct.inventory) return;
    // 執行 setLineItems，這樣的話 lineItems 被更新了，就會觸發 計算總金額，畫面上的總金額就會一起更新
    setLineItems((prev) => {
      return prev.map((item: LineItem) => {
        if (item.id === id) {
          return {
            id: item.id,
            title: item.title,
            price: item.price,
            inventory: item.inventory,
            quantity: item.quantity - 1,
          };
        }
        return item;
      });
    });
    // 執行 setProducts，這樣的話 products 被更新了，就會觸發新的 render
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
