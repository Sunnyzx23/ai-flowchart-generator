import React from 'react';
import { cn } from '../../utils/cn';

const Layout = ({ children, className, onNavigate, currentPage }) => {
  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 
                className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600"
                onClick={() => onNavigate && onNavigate('input')}
              >
                AI流程图生成工具
              </h1>
            </div>
            
            {/* 导航菜单 */}
            {onNavigate && (
              <nav className="hidden md:flex space-x-4">
                <button 
                  onClick={() => onNavigate('input')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === 'input' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  需求输入
                </button>
              </nav>
            )}
            
            <div className="text-sm text-gray-500">
              MVP版本
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            © 2024 AI流程图生成工具 - 专注于产品经理和营销人员的智能业务流程图生成
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
