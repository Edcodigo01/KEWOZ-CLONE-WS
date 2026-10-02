const { getLast7DaysCatalogViews } = require("../../service/repository/user.service");
const { generalResponse } = require("../../helper/response.helper");
const { getLast7DaysIndividualChats } = require("../../service/repository/Participant.service");
const { getLast7DaysStoryViews } = require("../../service/repository/Story.service");


async function user_dashboard_data(req, res) {
  try {
    const user_id = req.authData.user_id;

    // Fetch all three dashboard metrics in parallel
    const [total_catalog_views, total_new_conversation, total_story_views] = await Promise.all([
      getLast7DaysCatalogViews(user_id),
      getLast7DaysIndividualChats(user_id),
      getLast7DaysStoryViews(user_id),
    ]);

    return generalResponse(
      res,
      {
        total_catalog_views: Number(total_catalog_views.totalViews),
        total_new_conversation: Number(total_new_conversation.length),
        total_story_views: Number(total_story_views.totalViews),
      },
      "user dashboard data",
      true,
      false
    );
  } catch (error) {
    console.error("Error in getting dashboard user data", error);
    return generalResponse(res, {}, "Something went wrong while fetching dashboard data!", false, true);
  }
}


module.exports = {
  user_dashboard_data
};  