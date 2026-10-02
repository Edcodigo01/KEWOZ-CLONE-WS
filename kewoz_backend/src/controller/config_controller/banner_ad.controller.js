const config_service = require("../../service/common/config.service");

async function getBannerAd(req, res) {
  try {
    const config = await config_service.getConfig();

    if (!config || !config.banner_enabled || !config.banner_active) {
      return res.status(200).json({ status: true, data: null });
    }

    return res.status(200).json({
      status: true,
      data: {
        title: config.banner_title || "",
        subtitle: config.banner_subtitle || "",
        image_url: config.banner_image || "",
        click_url: config.banner_click_url || "",
        active: config.banner_active || false,
      },
    });
  } catch (error) {
    console.error("Error in getBannerAd", error);
    return res.status(200).json({ status: true, data: null });
  }
}

module.exports = { getBannerAd };
