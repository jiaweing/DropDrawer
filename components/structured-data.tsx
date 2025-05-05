"use client";

import { useEffect } from "react";

export function StructuredData() {
  useEffect(() => {
    // Add JSON-LD to the document head
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "DropDrawer",
      "applicationCategory": "WebApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": "A responsive component that automatically switches between a dropdown menu on desktop and a drawer on mobile devices for shadcn/ui",
      "author": {
        "@type": "Person",
        "name": "Jay",
        "url": "https://github.com/jiaweing"
      },
      "softwareVersion": "0.1.0",
      "license": "https://choosealicense.com/licenses/mit/",
      "url": "https://dropdrawer.jiawei.dev",
      "codeRepository": "https://github.com/jiaweing/DropDrawer"
    });
    document.head.appendChild(script);

    return () => {
      // Clean up when component unmounts
      document.head.removeChild(script);
    };
  }, []);

  return null;
}
