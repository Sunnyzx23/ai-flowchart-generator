import React, { Component } from 'react';
import AIErrorHandler from './AIErrorHandler';

/**
 * AI分析错误边界组件
 * 捕获和处理React组件树中的JavaScript错误
 */
class AIErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // 更新state使下一次渲染能够显示降级后的UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error, errorInfo) {
    // 捕获错误信息
    this.setState({
      error,
      errorInfo
    });

    // 错误上报（可选）
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 控制台记录错误
    console.error('AI Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
  };

  render() {
    if (this.state.hasError) {
      // 自定义错误UI
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error,
          this.handleRetry,
          this.handleReset
        );
      }

      // 默认错误UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <AIErrorHandler
            error={this.state.error}
            errorType="unknown"
            onRetry={this.handleRetry}
            onCancel={this.handleReset}
            showDetails={process.env.NODE_ENV === 'development'}
            retryCount={this.state.retryCount}
            maxRetries={this.props.maxRetries || 3}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 高阶组件：为组件添加错误边界
 */
export const withErrorBoundary = (WrappedComponent, errorBoundaryProps = {}) => {
  const WithErrorBoundaryComponent = (props) => (
    <AIErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </AIErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = 
    `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorBoundaryComponent;
};

/**
 * Hook版本的错误边界
 */
export const useErrorBoundary = () => {
  const [error, setError] = React.useState(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return {
    captureError,
    resetError
  };
};

export default AIErrorBoundary;
