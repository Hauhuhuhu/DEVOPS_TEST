import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 60 * 1000,
      // staleTime: 0,
      // Hàm xác định xem có nên thử lại hay không
      retry: (failureCount, error) => {
        // Không retry nếu là lỗi 401 hoặc 403
        if (error.response?.status === 401 || error.response?.status === 403) {
          return false;
        }
        // Các lỗi khác (như đứt cáp, rớt mạng) thì vẫn retry tối đa 3 lần
        return failureCount < 3;
      },
    },
  },
});
