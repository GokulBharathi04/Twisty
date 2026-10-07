import { useEffect } from "react";

export const useSeo = (title, description, jsonLd) => {
  useEffect(() => {
    document.title = title ? `${title} | Twisty Wrap Enterprises` : "Twisty Wrap Enterprises | Packaging, Printing & Industrial Supplies";
    const meta = document.querySelector('meta[name="description"]');
    if (meta && description) meta.setAttribute("content", description);
    let script;
    if (jsonLd) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
    return () => {
      if (script) script.remove();
    };
  }, [title, description, jsonLd]);
};
