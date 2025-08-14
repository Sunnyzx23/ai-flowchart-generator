import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';

/**
 * 流程图容器组件
 * 提供响应式布局和自适应功能
 */
const FlowchartContainer = ({
  children,
  className = '',
  minWidth = 320,
  minHeight = 240,
  aspectRatio = null, // '16:9', '4:3', '1:1' etc.
  responsive = true,
  autoResize = true
}) => {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [deviceType, setDeviceType] = useState('desktop');
  const containerRef = React.useRef(null);

  // 检测设备类型
  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  // 监听容器尺寸变化
  useEffect(() => {
    if (!autoResize || !containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [autoResize]);

  // 计算容器样式
  const getContainerStyle = () => {
    const style = {
      minWidth: `${minWidth}px`,
      minHeight: `${minHeight}px`
    };

    // 处理宽高比
    if (aspectRatio && containerSize.width > 0) {
      const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
      const calculatedHeight = (containerSize.width * heightRatio) / widthRatio;
      
      if (calculatedHeight >= minHeight) {
        style.height = `${calculatedHeight}px`;
      }
    }

    return style;
  };

  // 获取响应式类名
  const getResponsiveClasses = () => {
    if (!responsive) return '';

    const classes = [];
    
    switch (deviceType) {
      case 'mobile':
        classes.push('flowchart-mobile');
        break;
      case 'tablet':
        classes.push('flowchart-tablet');
        break;
      default:
        classes.push('flowchart-desktop');
    }

    return classes.join(' ');
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'flowchart-container relative',
        responsive && 'w-full',
        getResponsiveClasses(),
        className
      )}
      style={getContainerStyle()}
    >
      {/* 容器内容 */}
      {React.cloneElement(children, {
        containerSize,
        deviceType,
        ...children.props
      })}

      {/* 响应式断点指示器（开发模式） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
          {deviceType} ({containerSize.width}×{containerSize.height})
        </div>
      )}
    </div>
  );
};

/**
 * 流程图网格布局组件
 * 用于展示多个流程图的网格布局
 */
export const FlowchartGrid = ({
  items = [],
  columns = 'auto', // auto, 1, 2, 3, 4
  gap = 4,
  className = '',
  renderItem = null
}) => {
  // 计算网格列数
  const getGridColumns = () => {
    if (columns === 'auto') {
      const width = window.innerWidth;
      if (width < 768) return 1;
      if (width < 1024) return 2;
      if (width < 1440) return 3;
      return 4;
    }
    return columns;
  };

  const [gridColumns, setGridColumns] = useState(getGridColumns());

  useEffect(() => {
    if (columns === 'auto') {
      const handleResize = () => setGridColumns(getGridColumns());
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [columns]);

  return (
    <div
      className={cn(
        'grid gap-4',
        `grid-cols-${gridColumns}`,
        `gap-${gap}`,
        className
      )}
    >
      {items.map((item, index) => (
        <div key={item.id || index} className="flowchart-grid-item">
          {renderItem ? renderItem(item, index) : (
            <FlowchartContainer
              responsive={true}
              aspectRatio="16:9"
              className="border rounded-lg overflow-hidden"
            >
              {item.content}
            </FlowchartContainer>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * 流程图分屏布局组件
 * 支持左右分屏或上下分屏
 */
export const FlowchartSplitView = ({
  leftContent = null,
  rightContent = null,
  topContent = null,
  bottomContent = null,
  direction = 'horizontal', // horizontal, vertical
  ratio = 0.5, // 分割比例 0-1
  resizable = true,
  className = ''
}) => {
  const [splitRatio, setSplitRatio] = useState(ratio);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e) => {
    if (!resizable) return;
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !resizable) return;

    const container = e.currentTarget.parentElement;
    const rect = container.getBoundingClientRect();
    
    let newRatio;
    if (direction === 'horizontal') {
      newRatio = (e.clientX - rect.left) / rect.width;
    } else {
      newRatio = (e.clientY - rect.top) / rect.height;
    }
    
    setSplitRatio(Math.max(0.1, Math.min(0.9, newRatio)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const isHorizontal = direction === 'horizontal';
  const primaryContent = isHorizontal ? leftContent : topContent;
  const secondaryContent = isHorizontal ? rightContent : bottomContent;

  return (
    <div
      className={cn(
        'flex w-full h-full',
        isHorizontal ? 'flex-row' : 'flex-col',
        className
      )}
    >
      {/* 主内容区域 */}
      <div
        className="overflow-hidden"
        style={{
          [isHorizontal ? 'width' : 'height']: `${splitRatio * 100}%`
        }}
      >
        {primaryContent}
      </div>

      {/* 分割线 */}
      {resizable && (
        <div
          className={cn(
            'bg-gray-300 hover:bg-gray-400 transition-colors',
            isHorizontal ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize',
            isDragging && 'bg-blue-400'
          )}
          onMouseDown={handleMouseDown}
        />
      )}

      {/* 次内容区域 */}
      <div
        className="overflow-hidden"
        style={{
          [isHorizontal ? 'width' : 'height']: `${(1 - splitRatio) * 100}%`
        }}
      >
        {secondaryContent}
      </div>
    </div>
  );
};

export default FlowchartContainer;
