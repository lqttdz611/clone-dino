import { useEffect } from "react";

export const useDevToolsBlocker = () => {
  useEffect(() => {
    // Chặn click chuột phải
    const handleContextMenu = (e) => {
      e.preventDefault();
    }; // Chặn các phím tắt mở DevTools

    const handleKeyDown = (e) => {
      // F12
      if (e.key === "F12") {
        e.preventDefault();
      } // Ctrl+Shift+I (Windows/Linux)
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault();
      } // Ctrl+Shift+J (Windows/Linux)
      if (e.ctrlKey && e.shiftKey && e.key === "J") {
        e.preventDefault();
      }
      // Cmd+Option+I (Mac)
      if (e.metaKey && e.altKey && e.key === "i") {
        e.preventDefault();
      }
      // Cmd+Option+J (Mac)
      if (e.metaKey && e.altKey && e.key === "j") {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown); // Dọn dẹp listener khi component unmount

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy một lần khi component được mount
};
