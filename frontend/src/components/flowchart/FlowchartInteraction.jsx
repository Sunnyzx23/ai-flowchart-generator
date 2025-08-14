import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '../../utils/cn';

/**
 * 流程图交互控制器
 * 实现缩放、平移等交互功能
 */
const FlowchartInteraction = ({
  children,
  className = '',
  minScale = 0.1,
  maxScale = 5,
  initialScale = 1,
  wheelSensitivity = 0.1,
  panSensitivity = 1,
  enableWheel = true,
  enablePan = true,
  enableTouch = true,
  enableAnimation = true,
  onScaleChange = null,
  onPositionChange = null,
  onInteractionStart = null,
  onInteractionEnd = null
}) => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(initialScale);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);

  // 触摸相关状态
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0, distance: 0 });
  const [lastTouchScale, setLastTouchScale] = useState(1);

  // 获取容器边界
  const getContainerBounds = useCallback(() => {
    if (!containerRef.current) return { width: 0, height: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }, []);

  // 获取内容边界
  const getContentBounds = useCallback(() => {
    if (!contentRef.current) return { width: 0, height: 0 };
    const rect = contentRef.current.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }, []);

  // 计算平移边界
  const calculatePanBounds = useCallback((currentScale) => {
    const container = getContainerBounds();
    const content = getContentBounds();
    
    const scaledWidth = content.width * currentScale;
    const scaledHeight = content.height * currentScale;
    
    const maxX = Math.max(0, (scaledWidth - container.width) / 2);
    const maxY = Math.max(0, (scaledHeight - container.height) / 2);
    
    return {
      minX: -maxX,
      maxX: maxX,
      minY: -maxY,
      maxY: maxY
    };
  }, [getContainerBounds, getContentBounds]);

  // 限制位置在边界内
  const constrainPosition = useCallback((pos, currentScale) => {
    const bounds = calculatePanBounds(currentScale);
    return {
      x: Math.max(bounds.minX, Math.min(bounds.maxX, pos.x)),
      y: Math.max(bounds.minY, Math.min(bounds.maxY, pos.y))
    };
  }, [calculatePanBounds]);

  // 设置缩放
  const updateScale = useCallback((newScale, centerPoint = null) => {
    const clampedScale = Math.max(minScale, Math.min(maxScale, newScale));
    
    if (clampedScale === scale) return;

    let newPosition = { ...position };

    // 如果提供了中心点，计算相对于中心点的缩放
    if (centerPoint && containerRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      const centerX = centerPoint.x - container.left - container.width / 2;
      const centerY = centerPoint.y - container.top - container.height / 2;
      
      const scaleRatio = clampedScale / scale;
      newPosition.x = centerX - (centerX - position.x) * scaleRatio;
      newPosition.y = centerY - (centerY - position.y) * scaleRatio;
    }

    // 限制位置在边界内
    newPosition = constrainPosition(newPosition, clampedScale);

    setScale(clampedScale);
    setPosition(newPosition);
    
    onScaleChange?.(clampedScale);
    onPositionChange?.(newPosition);
  }, [scale, position, minScale, maxScale, constrainPosition, onScaleChange, onPositionChange]);

  // 设置位置
  const updatePosition = useCallback((newPosition) => {
    const constrainedPosition = constrainPosition(newPosition, scale);
    setPosition(constrainedPosition);
    onPositionChange?.(constrainedPosition);
  }, [scale, constrainPosition, onPositionChange]);

  // 鼠标滚轮处理
  const handleWheel = useCallback((e) => {
    if (!enableWheel || isAnimating) return;
    
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -wheelSensitivity : wheelSensitivity;
    const newScale = scale * (1 + delta);
    const centerPoint = { x: e.clientX, y: e.clientY };
    
    updateScale(newScale, centerPoint);
  }, [enableWheel, isAnimating, scale, wheelSensitivity, updateScale]);

  // 鼠标按下处理
  const handleMouseDown = useCallback((e) => {
    if (!enablePan || e.button !== 0) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setLastPanPoint({ x: e.clientX, y: e.clientY });
    
    onInteractionStart?.('pan');
    
    // 阻止默认行为和选择
    e.preventDefault();
    document.body.style.userSelect = 'none';
  }, [enablePan, onInteractionStart]);

  // 鼠标移动处理
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !enablePan) return;
    
    const deltaX = (e.clientX - lastPanPoint.x) * panSensitivity;
    const deltaY = (e.clientY - lastPanPoint.y) * panSensitivity;
    
    updatePosition({
      x: position.x + deltaX,
      y: position.y + deltaY
    });
    
    setLastPanPoint({ x: e.clientX, y: e.clientY });
  }, [isDragging, enablePan, lastPanPoint, panSensitivity, position, updatePosition]);

  // 鼠标释放处理
  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    document.body.style.userSelect = '';
    
    onInteractionEnd?.('pan');
  }, [isDragging, onInteractionEnd]);

  // 触摸开始处理
  const handleTouchStart = useCallback((e) => {
    if (!enableTouch) return;
    
    const touches = e.touches;
    
    if (touches.length === 1) {
      // 单指平移
      const touch = touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY, distance: 0 });
      onInteractionStart?.('pan');
    } else if (touches.length === 2) {
      // 双指缩放
      const touch1 = touches[0];
      const touch2 = touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      setTouchStart({
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
        distance: distance
      });
      setLastTouchScale(scale);
      onInteractionStart?.('zoom');
    }
    
    e.preventDefault();
  }, [enableTouch, scale, onInteractionStart]);

  // 触摸移动处理
  const handleTouchMove = useCallback((e) => {
    if (!enableTouch) return;
    
    const touches = e.touches;
    
    if (touches.length === 1 && touchStart.distance === 0) {
      // 单指平移
      const touch = touches[0];
      const deltaX = (touch.clientX - touchStart.x) * panSensitivity;
      const deltaY = (touch.clientY - touchStart.y) * panSensitivity;
      
      updatePosition({
        x: position.x + deltaX,
        y: position.y + deltaY
      });
      
      setTouchStart({ x: touch.clientX, y: touch.clientY, distance: 0 });
    } else if (touches.length === 2) {
      // 双指缩放
      const touch1 = touches[0];
      const touch2 = touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      if (touchStart.distance > 0) {
        const scaleRatio = distance / touchStart.distance;
        const newScale = lastTouchScale * scaleRatio;
        const centerPoint = {
          x: (touch1.clientX + touch2.clientX) / 2,
          y: (touch1.clientY + touch2.clientY) / 2
        };
        
        updateScale(newScale, centerPoint);
      }
    }
    
    e.preventDefault();
  }, [enableTouch, touchStart, panSensitivity, position, updatePosition, lastTouchScale, updateScale]);

  // 触摸结束处理
  const handleTouchEnd = useCallback((e) => {
    if (!enableTouch) return;
    
    setTouchStart({ x: 0, y: 0, distance: 0 });
    onInteractionEnd?.('touch');
  }, [enableTouch, onInteractionEnd]);

  // 重置视图
  const resetView = useCallback(() => {
    if (enableAnimation) {
      setIsAnimating(true);
      
      // 使用CSS过渡动画
      if (contentRef.current) {
        contentRef.current.style.transition = 'transform 0.3s ease-out';
        setTimeout(() => {
          if (contentRef.current) {
            contentRef.current.style.transition = '';
          }
          setIsAnimating(false);
        }, 300);
      }
    }
    
    setScale(initialScale);
    setPosition({ x: 0, y: 0 });
    
    onScaleChange?.(initialScale);
    onPositionChange?.({ x: 0, y: 0 });
  }, [enableAnimation, initialScale, onScaleChange, onPositionChange]);

  // 适应屏幕
  const fitToScreen = useCallback(() => {
    const container = getContainerBounds();
    const content = getContentBounds();
    
    if (container.width === 0 || container.height === 0 || content.width === 0 || content.height === 0) {
      return;
    }
    
    const scaleX = (container.width * 0.9) / content.width;
    const scaleY = (container.height * 0.9) / content.height;
    const newScale = Math.min(scaleX, scaleY);
    
    if (enableAnimation) {
      setIsAnimating(true);
      
      if (contentRef.current) {
        contentRef.current.style.transition = 'transform 0.3s ease-out';
        setTimeout(() => {
          if (contentRef.current) {
            contentRef.current.style.transition = '';
          }
          setIsAnimating(false);
        }, 300);
      }
    }
    
    setScale(Math.max(minScale, Math.min(maxScale, newScale)));
    setPosition({ x: 0, y: 0 });
    
    onScaleChange?.(newScale);
    onPositionChange?.({ x: 0, y: 0 });
  }, [getContainerBounds, getContentBounds, enableAnimation, minScale, maxScale, onScaleChange, onPositionChange]);

  // 绑定事件监听器
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 鼠标事件
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('mousedown', handleMouseDown);
    
    // 触摸事件
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleWheel, handleMouseDown, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // 绑定文档级别的鼠标事件
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 暴露控制方法
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.flowchartInteraction = {
        scale,
        position,
        updateScale,
        updatePosition,
        resetView,
        fitToScreen,
        zoomIn: () => updateScale(scale * 1.2),
        zoomOut: () => updateScale(scale * 0.8)
      };
    }
  }, [scale, position, updateScale, updatePosition, resetView, fitToScreen]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden select-none',
        isDragging && 'cursor-grabbing',
        !isDragging && enablePan && 'cursor-grab',
        className
      )}
      style={{ touchAction: 'none' }}
    >
      <div
        ref={contentRef}
        className="transform-gpu"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          willChange: isAnimating ? 'transform' : 'auto'
        }}
      >
        {children}
      </div>
      
      {/* 调试信息 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs p-2 rounded">
          <div>Scale: {scale.toFixed(2)}</div>
          <div>X: {position.x.toFixed(0)}</div>
          <div>Y: {position.y.toFixed(0)}</div>
          {isDragging && <div>Dragging</div>}
        </div>
      )}
    </div>
  );
};

export default FlowchartInteraction;
