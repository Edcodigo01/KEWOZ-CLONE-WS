const config_service = require("../../service/common/config.service");

// Public endpoint: returns splash/interstitial config
// Called by Flutter app on open, and by kewoz.com index.html
async function getSplashAd(req, res) {
  try {
    const config = await config_service.getConfig();

    if (!config || !config.splash_enabled) {
      return res.status(200).json({ status: true, data: null });
    }

    const imageUrl = config.splash_image || "";
    const fullImageUrl = imageUrl.startsWith("http")
      ? imageUrl
      : imageUrl
        ? `${process.env.baseUrl}/${imageUrl.replace(/^\//, "")}`
        : "";

    const imageUrlMobile = config.splash_image_mobile || "";
    const fullImageUrlMobile = imageUrlMobile.startsWith("http")
      ? imageUrlMobile
      : imageUrlMobile
        ? `${process.env.baseUrl}/${imageUrlMobile.replace(/^\//, "")}`
        : "";

    // Parse splash_extra JSON for advanced config (icons, overlays, etc.)
    let extra = {};
    try {
      if (config.splash_extra) {
        extra = typeof config.splash_extra === "string"
          ? JSON.parse(config.splash_extra)
          : config.splash_extra;
      }
    } catch (e) {
      extra = {};
    }

    // Parse splash_buttons JSON for custom buttons
    let buttons = [];
    try {
      if (config.splash_buttons) {
        buttons = typeof config.splash_buttons === "string"
          ? JSON.parse(config.splash_buttons)
          : config.splash_buttons;
      }
    } catch (e) {
      buttons = [];
    }

    // Parse splash_template_mobile JSON for mobile-specific overrides
    let templateMobile = null;
    try {
      if (config.splash_template_mobile) {
        const parsed = typeof config.splash_template_mobile === "string"
          ? JSON.parse(config.splash_template_mobile)
          : config.splash_template_mobile;
        if (parsed && parsed.enabled) {
          templateMobile = parsed;
        }
      }
    } catch (e) {
      templateMobile = null;
    }

    return res.status(200).json({
      status: true,
      data: {
        // Basic
        title: config.splash_title || extra.title || "",
        subtitle: config.splash_subtitle || extra.subtitle || "",
        image_url: fullImageUrl,
        image_url_mobile: fullImageUrlMobile,
        click_url: config.splash_click_url || "",
        duration_seconds: typeof config.splash_duration === "number" ? config.splash_duration : 4,
        active: true,
        template_mobile: templateMobile,

        // Mode and styling
        mode: config.splash_mode || "template",
        bg_color: config.splash_bg_color || "#1A0033",
        bg_color_end: config.splash_bg_color_end || "#3D0066",
        use_gradient: extra.use_gradient !== false,

        // Advanced (from extra) - flattened so the client can read top-level
        icon_url: extra.icon_url || "",
        icon_enabled: extra.icon_enabled || false,
        icon_size: typeof extra.icon_size === "number" ? extra.icon_size : 80,
        icon_x: typeof extra.icon_x === "number" ? extra.icon_x : 50,
        icon_y: typeof extra.icon_y === "number" ? extra.icon_y : 15,

        // Title (flattened)
        title_size: typeof extra.title_size === "number" ? extra.title_size : 48,
        title_x: typeof extra.title_x === "number" ? extra.title_x : 50,
        title_y: typeof extra.title_y === "number" ? extra.title_y : 45,
        title_font_family: extra.title_font_family || "Inter",

        // Subtitle (flattened)
        subtitle_size: typeof extra.subtitle_size === "number" ? extra.subtitle_size : 22,
        subtitle_x: typeof extra.subtitle_x === "number" ? extra.subtitle_x : 50,
        subtitle_y: typeof extra.subtitle_y === "number" ? extra.subtitle_y : 55,
        subtitle_font_family: extra.subtitle_font_family || "Inter",

        // Skip button (flattened)
        show_skip_button: extra.show_skip_button !== false,
        skip_button_text: extra.skip_button_text || "Saltar",
        skip_button_color: extra.skip_button_color || "#000000",
        skip_button_text_color: extra.skip_button_text_color || "#FFFFFF",
        skip_button_x: typeof extra.skip_button_x === "number" ? extra.skip_button_x : 92,
        skip_button_y: typeof extra.skip_button_y === "number" ? extra.skip_button_y : 6,
        skip_button_font_family: extra.skip_button_font_family || "Inter",

        // Image mode options
        image_fit: extra.image_fit || "cover",
        image_position_y: extra.image_position_y || "center",
        image_blur: extra.image_blur || 0,
        image_brightness: extra.image_brightness || 100,
        image_contrast: extra.image_contrast || 100,

        // Overlay
        overlay_enabled: extra.overlay_enabled || false,
        overlay_color: extra.overlay_color || "#000000",
        overlay_opacity: extra.overlay_opacity || 0.5,
        gradient_overlay_enabled: extra.gradient_overlay_enabled || false,
        gradient_overlay_color_start: extra.gradient_overlay_color_start || "#1A0033",
        gradient_overlay_color_end: extra.gradient_overlay_color_end || "#3D0066",
        gradient_overlay_opacity: extra.gradient_overlay_opacity || 0.5,
        gradient_overlay_direction: extra.gradient_overlay_direction || "to-bottom",

        // Custom buttons (for both template and image modes)
        buttons: Array.isArray(buttons) ? buttons : [],
      },
    });
  } catch (error) {
    console.error("Error in getSplashAd", error);
    return res.status(200).json({ status: true, data: null });
  }
}

module.exports = {
  getSplashAd,
};
