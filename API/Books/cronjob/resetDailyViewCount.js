const BooksResourceAccess = require('../resourceAccess/BooksResourceAccess');
const Logger = require('../../../utils/logging');

async function resetDailyCount() {
  let result = await BooksResourceAccess.resetDayViewedCount();
  Logger.info(__filename, " result : " + result);
}

resetDailyCount();