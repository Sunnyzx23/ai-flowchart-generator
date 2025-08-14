import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并Tailwind CSS类名的工具函数
 * 使用clsx处理条件类名，使用tailwind-merge去重和合并冲突的类名
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
