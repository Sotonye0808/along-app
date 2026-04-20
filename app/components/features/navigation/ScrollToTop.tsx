"use client";

import React, { useState, useEffect } from "react";
import { FloatButton } from "antd";
import { VerticalAlignTopOutlined } from "@ant-design/icons";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button when user scrolls past 500px
      if (window.scrollY > 500) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <FloatButton
      icon={<VerticalAlignTopOutlined />}
      type="primary"
      onClick={scrollToTop}
      style={{
        right: 24,
        bottom: 80, // Position above mobile nav
      }}
      tooltip="Scroll to top"
      aria-label="Scroll to top"
    />
  );
}
