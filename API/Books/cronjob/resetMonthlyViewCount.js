const BooksResourceAccess = require('../resourceAccess/BooksResourceAccess');
const Logger = require('../../../utils/logging');

async function resetMonthlyCount() {
  let result = await BooksResourceAccess.resetMonthViewedCount();
  Logger.info(__filename, " result : " + result);
}

resetMonthlyCount();