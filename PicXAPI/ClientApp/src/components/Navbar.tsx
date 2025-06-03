import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Palette, LogIn, UserPlus, ShoppingCart, MessageSquare, User } from 'lucide-react';

const Navbar = () => {
  const user = useStore(state => state.user);
  const cart = useStore(state => state.cart);
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Palette className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-800">PicX</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {['buyer', 'artist'].includes(user.role) && (
                  <>
                    <Link to="/cart\" className="relative">
                      <ShoppingCart className="h-6 w-6 text-gray-600 hover:text-indigo-600" />
                      {cart.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {cart.length}
                        </span>
                      )}
                    </Link>
                    <Link to="/chat">
                      <MessageSquare className="h-6 w-6 text-gray-600 hover:text-indigo-600" />
                    </Link>
                  </>
                )}
                <div className="relative group">
                  <button className="flex items-center space-x-1">
                    <User className="h-6 w-6 text-gray-600" />
                    <span className="text-gray-600">{user.name}</span>
                  </button>
                  <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-lg shadow-xl hidden group-hover:block">
                    <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                      Profile
                    </Link>
                    <Link to="/dashboard" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                      Dashboard
                    </Link>
                    {['artist', 'admin'].includes(user.role) && (
                      <Link to="/products" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                        Manage Products
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <>
                        <Link to="/users" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                          User List
                        </Link>
                        <Link to="/finance" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                          Finance
                        </Link>
                      </>
                    )}
                    <button
                      onClick={() => {
                        useStore.getState().setUser(null);
                        navigate('/login');
                      }}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;