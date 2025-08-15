import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui';

const DrawioGuide = ({ mermaidCode, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(mermaidCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const openDrawio = () => {
    window.open('https://app.diagrams.net/', '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0">
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">🎯 Draw.io导入流程图指南</CardTitle>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* 步骤指导 */}
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  📋 第一步：复制Mermaid代码
                </h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={copyCode}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      copied
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {copied ? '✅ 已复制' : '📋 复制代码'}
                  </button>
                  <span className="text-sm text-blue-700">
                    点击按钮复制Mermaid代码到剪贴板
                  </span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  🚀 第二步：打开Draw.io
                </h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={openDrawio}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    🔗 打开Draw.io
                  </button>
                  <span className="text-sm text-green-700">
                    在新窗口中打开Draw.io编辑器
                  </span>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-800 mb-3">
                  ✨ 第三步：导入Mermaid代码
                </h3>
                <div className="space-y-3">
                  <div className="text-sm text-purple-700">
                    <strong>方法一（推荐）：</strong>
                    <ol className="list-decimal list-inside mt-1 space-y-1 ml-4">
                      <li>在Draw.io中点击左侧的 <code className="bg-purple-100 px-1 rounded">+</code> 按钮</li>
                      <li>选择 <code className="bg-purple-100 px-1 rounded">更多图形</code></li>
                      <li>找到并点击 <code className="bg-purple-100 px-1 rounded">Mermaid</code></li>
                      <li>在弹出框中粘贴代码（Ctrl+V）</li>
                      <li>点击 <code className="bg-purple-100 px-1 rounded">插入</code> 按钮</li>
                    </ol>
                  </div>
                  
                  <div className="text-sm text-purple-700 mt-3">
                    <strong>方法二（备选）：</strong>
                    <ol className="list-decimal list-inside mt-1 space-y-1 ml-4">
                      <li>点击菜单 <code className="bg-purple-100 px-1 rounded">排列</code> → <code className="bg-purple-100 px-1 rounded">插入</code> → <code className="bg-purple-100 px-1 rounded">高级</code> → <code className="bg-purple-100 px-1 rounded">Mermaid</code></li>
                      <li>粘贴代码并点击插入</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  💡 常见问题
                </h3>
                <div className="text-sm text-yellow-700 space-y-2">
                  <div>
                    <strong>Q: 找不到Mermaid选项？</strong><br/>
                    A: 可以手动绘制流程图，或者尝试创建新的空白图表后再查找Mermaid选项。
                  </div>
                  <div>
                    <strong>Q: 代码导入失败？</strong><br/>
                    A: 请确保代码完整复制，或者联系技术支持。
                  </div>
                  <div>
                    <strong>Q: 想要编辑流程图？</strong><br/>
                    A: 导入成功后，可以直接在Draw.io中编辑节点、连线和样式。
                  </div>
                </div>
              </div>

              {/* 代码预览 */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  📝 Mermaid代码预览
                </h3>
                <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
                  <code>{mermaidCode}</code>
                </pre>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                关闭指南
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DrawioGuide;
