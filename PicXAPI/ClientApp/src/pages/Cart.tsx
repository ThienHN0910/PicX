import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingCart } from 'lucide-react';
import { useStore } from '../lib/store';
import { Button } from '../components/ui/Button';

const Cart = () => {
  const { cart, removeFromCart } = useStore();
  
  const total = cart.reduce((sum, item) => sum + item.product.price, 0);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any artwork to your cart yet.</p>
          <Link to="/">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {cart.map((item) => (
            <div key={item.product.product_id} className="p-6 flex items-center">
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
                <img
                  src={item.product.image_url}
                  alt={item.product.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="ml-6 flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.product.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      by {item.product.artist?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.product_id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

               
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-6">
          <div className="flex items-center justify-between">
            <p className="text-lg font-medium text-gray-900">Total</p>
            <p className="text-xl font-semibold text-gray-900">
              ${total.toLocaleString()}
            </p>
          </div>
          <div className="mt-6">
            <Button className="w-full">
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;