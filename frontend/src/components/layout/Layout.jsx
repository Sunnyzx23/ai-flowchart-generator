import React from 'react';
import { cn } from '../../utils/cn';

const Layout = ({ children, className }) => {
  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                AI流程图生成工具
              </h1>
            </div>
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
