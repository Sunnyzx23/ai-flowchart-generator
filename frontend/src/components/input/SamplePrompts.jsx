import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../ui';
import { cn } from '../../utils/cn';

const SAMPLE_PROMPTS = [
  {
    id: 'wps-ai-detection',
    title: 'WPS Office AI作业检测功能',
    description: '为WPS Office PC客户端新增AI作业检测能力',
    content: '我想对wps office 的pc客户端的用户，新增一个作业去ai感的能力（是指作业中ai生成内容的检测，并提供改写内容，减少ai感），我现在没有想好用户在端内要怎么触发，怎么使用这个功能，怎么设计试用和付费卡点，你帮我思考一下，并帮我设计业务流程图',
    productType: 'desktop', // 对应 '桌面端应用'
    implementType: 'ai', // 对应 'AI能力实现'
    category: '产品功能设计',
    tags: ['AI检测', '内容优化', '商业化']
  },
  {
    id: 'youtube-shorts-generator',
    title: 'YouTube Shorts视频生成工具',
    description: '自动化生成短视频的Web工具平台',
    content: '我想做一个自动化生成youtube shorts 视频的web工具，大概想法是，用户输入一个需求提示词，或者给到产品描述，然后生成至少3个shorts视频的脚本，再生成对应的短视频，请帮我设计这个业务流程图',
    productType: 'web', // 对应 'Web端应用'
    implementType: 'ai', // 对应 'AI能力实现'
    category: '内容生成平台',
    tags: ['视频生成', '内容创作', 'AI工具']
  },
  {
    id: 'software-uninstall-optimization',
    title: 'PC软件卸载流程优化',
    description: '优化软件卸载体验，提升用户留存',
    content: '你是某PC办公软件的产品经理，现在需要在PRD文档中绘制一份【产品卸载流程优化图】。请根据以下要求生成：\n\n起点：用户在系统中选择【卸载软件】。\n\n卸载面板：弹出卸载面板，询问用户卸载原因。\n\n分支逻辑（示例）：\n\n如果用户选择【收费太贵】，则展示"赠送30天免费会员试用"的挽留方案，用户可选择【接受并继续使用】或【仍然卸载】。\n\n如果用户选择【功能不满足需求】，则展示"功能推荐/帮助文档/升级版本介绍"，用户可选择【查看并保留软件】或【仍然卸载】。\n\n如果用户选择【软件体验差/性能问题】，则展示"问题反馈通道"或"性能优化建议"，用户可选择【提交反馈并保留】或【仍然卸载】。\n\n如果用户直接选择【继续卸载】，则进入正式卸载流程。\n\n终点：完成卸载（或用户被成功挽留）。\n\n图示要求：用流程图形式展示，需包含关键节点（卸载入口、卸载原因选择、对应解决方案、用户操作分支、最终结果）。',
    productType: 'desktop', // 对应 '桌面端应用'
    implementType: 'traditional', // 对应 '传统功能实现'
    category: '用户体验优化',
    tags: ['用户留存', '卸载挽留', '流程设计']
  }
];

const SamplePrompts = ({ onSelect, className }) => {
  return (
    <div className={cn("space-y-4", className)}>
      {/* 简化的标题 */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>💡 快速开始：</span>
        <span>点击下方示例快速体验</span>
      </div>

      {/* 标签云样式的示例 */}
      <div className="flex flex-wrap gap-2">
        {SAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt.id}
            className="inline-flex items-center px-3 py-2 rounded-full text-sm border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 cursor-pointer"
            onClick={() => onSelect && onSelect(prompt)}
            title={prompt.description}
          >
            <span className="text-xs mr-1">
              {prompt.category === '产品功能设计' ? '🔧' : 
               prompt.category === '内容生成平台' ? '🎬' : 
               prompt.category === '用户体验优化' ? '✨' : '💡'}
            </span>
            {prompt.title}
          </button>
        ))}
      </div>


    </div>
  );
};

export default SamplePrompts;
