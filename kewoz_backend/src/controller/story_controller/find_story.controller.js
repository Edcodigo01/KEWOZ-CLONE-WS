const { generalResponse } = require("../../helper/response.helper");
const {
  getStory,
} = require("../../service/repository/Story.service");
const { getUser } = require("../../service/repository/user.service");
const updateFieldsFilter = require("../../helper/updateField.helper");

async function findStory(req, res) {
    try {
        const user_id = req.authData.user_id;

        const isUser = await getUser({ user_id });
        if (!isUser) {
            return generalResponse(res, {}, "User Not found", false, 404);
        }

        let filteredData;
        const allowedUpdateFieldsMandatory = ['story_id'];

        try {
            filteredData = updateFieldsFilter(req.body, allowedUpdateFieldsMandatory, true);
        } catch (err) {
            return generalResponse(res, { success: false }, err.message,  true);
        }

        // Fetch story
        let story = await getStory({
            story_id: filteredData.story_id,
            is_expired: false
        });

        if (!story) {
            return generalResponse(res, {}, "Story not found", false,  404);
        }

        // Extract viewer IDs from objects
        const viewsArray = story.views || [];

        // Convert [{user_id, viewed_at}] → user records
        let userViews = await Promise.all(
            viewsArray.map(async (v) => {
                let user = await getUser({ user_id: v.user_id });
                user = user.toJSON();
                if (!user) return null;

                return {
                    ...user,     // all user fields
                    viewed_at: v.viewed_at  // add timestamp
                };
            })
        );

        // Flatten `dataValues`
        userViews = userViews.filter(v => v !== null);


        // If viewing own story → return with viewer details
        if (user_id === story.user_id) {
            story = story.toJSON();
            return generalResponse(
                res,
                { ...story, views: userViews },
                "Story Found!",
                true,
                true
            );
        }

        // Fetch story owner
        const story_owner = await getUser({ user_id: story.user_id });

        // Create new view object
        const newView = {
            user_id,
            viewed_at: new Date()
        };

        // Remove previous view by this user
        const filteredViews = viewsArray.filter(v => v.user_id !== user_id);

        // Add new view at the end
        story.views = [...filteredViews, newView];

        await story.save();

        return generalResponse(
            res,
            { ...story, views: userViews },
            "Story Found!",
            true,
            true
        );
    }
    catch (error) {
        console.error("Error in fetching story", error);
        return generalResponse(res, { success: false }, error.message, false, 500);
    }
}


module.exports = {
  findStory,
};
