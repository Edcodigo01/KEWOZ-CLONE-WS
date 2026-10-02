const cron = require('node-cron');
const { Story, User, DailyUsers, sequelize} = require('../../../models');
const { Op } = require('sequelize');

// Runs every hour at minute 0 (e.g., 1:00, 2:00, 3:00...)
const scheduleStoryCleanup = () => {
    // Cron format: '0 * * * *' means "At minute 0 of every hour"
    cron.schedule('0 * * * *', async () => {
        try {
            await Story.update(
                { is_expired: true },
                {
                    where: {
                        expiresAt: {
                            [Op.lt]: new Date()
                        }
                    }
                }
            );
        } catch (error) {
            console.error('[Story Cleanup Cron] Error:', error);
        }
    });

};

const dailyActiveUsersCount = () => {
  // Run every day at 12:01 AM IST
  cron.schedule("1 0 * * *", async () => {
    try {
      // get IST "yesterday" start and end
      const startOfDayIST = new Date();
      startOfDayIST.setDate(startOfDayIST.getDate() - 1);
      startOfDayIST.setHours(0, 0, 0, 0);

      const endOfDayIST = new Date();
      endOfDayIST.setDate(endOfDayIST.getDate() - 1);
      endOfDayIST.setHours(23, 59, 59, 999);

      // Count users updated yesterday
      const count = await User.count({
        where: {
          updatedAt: {
            [Op.between]: [startOfDayIST, endOfDayIST],
          },
          user_type:'regular'
        },
      });
      const businesscount = await User.count({
        where: {
          updatedAt: {
            [Op.between]: [startOfDayIST, endOfDayIST],
          },
          user_type: 'business'

        },
      });

      // Insert record in DailyUsers
      await DailyUsers.create({
        users_count: count,
        business_users_count: count,
        date: startOfDayIST, // store "yesterday's date" (can format to yyyy-mm-dd if needed)
      });

    } catch (error) {
      console.error("❌ Error calculating daily active users:", error);
    }
  });
};

const MODELS_TO_SKIP = [
  'Admin',
  'Catalog_images',
  'Catalog',
  'Categories',
  'Avatar',
  'Config',
  'DailyUsers',
  'Language_translation',
  'Language',
  'Report_type',
  'User',
  'Story',
  'Broadcast_push_notification'
];

const DEMO_DATA_CUTOFF = new Date('2026-03-18T20:15:07.716+05:30');

const PARTIAL_CLEANUP = {

  Chat: {
    field: 'createdAt',
    afterTime: DEMO_DATA_CUTOFF,
    excludeConditions: {},
  },
  Message_seen: {
    field: 'createdAt',
    afterTime: DEMO_DATA_CUTOFF,
    excludeConditions: {},
  },
  Message: {
    field: 'createdAt',
    afterTime: DEMO_DATA_CUTOFF,
    excludeConditions: {},
  },
  Participant: {
    field: 'createdAt',
    afterTime: DEMO_DATA_CUTOFF,
    excludeConditions: {},
  },

};


const deleteDatain24Hours = () => {  
  // return;
  if (process?.env?.IS_CLIENT != 'true') {
    // return;    
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setHours(2, 0, 0, 0);

    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    const hoursLeft = ((nextRun - now) / (1000 * 60 * 60)).toFixed(2);

    cron.schedule('0 2 * * *', async () => {
      // cron.schedule('*/1 * * * *', async () => {
      try {
        const allModels = sequelize.models;

        for (const modelName in allModels) {
          if (MODELS_TO_SKIP.includes(modelName)) {
            continue;
          }

          const model = allModels[modelName];
          if (PARTIAL_CLEANUP[modelName]) {
            const { field, afterTime, excludeConditions } = PARTIAL_CLEANUP[modelName];
            const where = {
              [field]: {
                [Op.gte]: afterTime, // DELETE records created on or after the cutoff
              },
              ...excludeConditions,
            };

            const deleted = await model.destroy({ where });

          } else {
            const deleted = await model.destroy({ where: {} });
          }
        }


      } catch (err) {
        console.error(`[ERROR] Cleanup failed:`, err);
      }
    });

  }
}


module.exports = {
  scheduleStoryCleanup,
  dailyActiveUsersCount,
  deleteDatain24Hours
};