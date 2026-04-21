import ogs from "open-graph-scraper";


export const scrapeUrl = async (url) => {
  const defaultMeta = {
    title: "",
    description: "",
    siteName: "",
    previewImage: null,
  };

  try {
    const options = { url, timeout: 5000 }; // 5 second timeout to prevent hanging
    const { result, error } = await ogs(options);

    if (error) {
      console.warn(`[scrapeUrl] Failed to scrape metadata for ${url}`, result);
      return defaultMeta;
    }

    return {
      title: result.ogTitle || result.twitterTitle || result.dcTitle || "",
      description: result.ogDescription || result.twitterDescription || "",
      siteName: result.ogSiteName || "",
      previewImage: result.ogImage && result.ogImage.length > 0 ? result.ogImage[0].url : null,
    };
  } catch (err) {
    console.error(`[scrapeUrl] Error scraping ${url}:`, err.message);
    return defaultMeta;
  }
};
