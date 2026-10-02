const { generalResponse } = require("../../helper/response.helper");
const { getStory, updateStory } = require("../../service/repository/Story.service");
const updateFieldsFilter = require("../../helper/updateField.helper");

async function viewStory(req, res) {
    try {
        const user_id = req.authData.user_id;

        let filteredData;
        try {
            filteredData = updateFieldsFilter(req.body, ['story_id'], true);
        } catch (err) {
            return generalResponse(res, {}, err.message, false, true, 500);
        }

        // Fetch story
        let story = await getStory({
            story_id: filteredData.story_id,
            is_expired: false
        });

        if (!story) {
            return generalResponse(res, {}, "Story not found!", false, true, 500);
        }

        // Do not count own views
        if (story.user_id == user_id) {
            return generalResponse(res, story, "It's your story.", true, true, 200);
        }

        const oldViews = story.views || [];

        // Remove old view entry (avoid duplicates)
        const filteredViews = oldViews.filter(v => v.user_id != user_id);

        // Push new view object
        const newView = {
            user_id,
            viewed_at: new Date()
        };

        const updatedViews = [...filteredViews, newView];

        // Update story
        story = await updateStory(
            { views: updatedViews },
            { story_id: filteredData.story_id }
        );

        return generalResponse(res, story, "Story viewed!", true, true, 200);

    } catch (error) {
        return generalResponse(res, {}, error.message, false, true, 500);
    }
}


module.exports = {
    viewStory
};

