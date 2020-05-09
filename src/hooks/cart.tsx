import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const getProducts = await AsyncStorage.getItem('@GoMarketPlace:products');

      if (getProducts) {
        setProducts(JSON.parse(getProducts));
      }
    }

    loadProducts();
  }, []);

  const updateAsyncStorage = useCallback(async (): Promise<void> => {
    await AsyncStorage.clear();

    await AsyncStorage.setItem(
      '@GoMarketPlace:products',
      JSON.stringify(products),
    );
  }, [products]);

  useEffect(() => {
    updateAsyncStorage();
  }, [updateAsyncStorage]);

  const addToCart = useCallback(
    async product => {
      const findProduct = products.find(item => item.id === product.id);

      if (findProduct) {
        setProducts(
          products.map(item => {
            if (item.id === findProduct.id) {
              return { ...item, quantity: item.quantity + 1 };
            }

            return item;
          }),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      setProducts(
        products.map(item => {
          if (item.id === id) {
            return { ...item, quantity: item.quantity + 1 };
          }

          return item;
        }),
      );

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      setProducts(
        products.map(item => {
          if (item.id === id && item.quantity > 0) {
            // eslint-disable-next-line no-param-reassign
            return { ...item, quantity: item.quantity - 1 };
          }

          return item;
        }),
      );

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
