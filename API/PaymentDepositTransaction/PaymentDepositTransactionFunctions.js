/**
 * Created by A on 7/18/17.
 */
'use strict';
const DepositTransactionAccess = require("./resourceAccess/PaymentDepositTransactionResourceAccess");
const UserWallet = require('../Wallet/resourceAccess/WalletResourceAccess');

const DEPOSIT_TRX_STATUS = require('./PaymentDepositTransactionConstant').DEPOSIT_TRX_STATUS;
const WALLET_TYPE = require('../Wallet/WalletConstant').WALLET_TYPE;

async function createDepositTransaction(user, amount) {
  let wallet = await UserWallet.find({
    appUserId: user.appUserId,
    walletType: WALLET_TYPE.POINT
  });

  if (!wallet || wallet.length < 1) {
    console.error("user wallet is invalid");
    return undefined;
  }
  wallet = wallet[0];

  let transactionData = {
    appUserId: user.appUserId,
    walletId: wallet.walletId,
    paymentAmount: amount,
  };

  let result = await DepositTransactionAccess.insert(transactionData);
  if (result) {
    return result;
  } else {
    console.error("insert deposit transaction error");
    return undefined;
  }
}

async function approveDepositTransaction(transactionId, staff) {
  //get info of transaction
  let transaction = await DepositTransactionAccess.find({
    paymentDepositTransactionId: transactionId
  });

  if (!transaction || transaction.length < 1) {
    console.error("transaction is invalid");
    return undefined;
  }
  transaction = transaction[0];

  if (!(transaction.status === DEPOSIT_TRX_STATUS.NEW || transaction.status === DEPOSIT_TRX_STATUS.WAITING || transaction.status !== DEPOSIT_TRX_STATUS.PENDING)) {
    console.error("deposit transaction was approved or canceled");
    return undefined;
  }

  //get wallet info of user
  let pointWallet = await UserWallet.find({
    appUserId: transaction.appUserId,
    walletType: WALLET_TYPE.POINT
  });

  if (!pointWallet || pointWallet.length < 1) {
    console.error("pointWallet is invalid");
    return undefined;
  }
  pointWallet = pointWallet[0];

  //Change payment status and store info of PIC
  transaction.paymentStatus = DEPOSIT_TRX_STATUS.COMPLETED;
  if (staff) {
    transaction.paymentPICId = staff.staffId;
  }

  transaction.paymentApproveDate = new Date();

  delete transaction.paymentDepositTransactionId;

  //Update payment in DB
  let updateTransactionResult = await DepositTransactionAccess.updateById(transactionId, transaction);
  if (updateTransactionResult) {
    //Update wallet balance in DB
    let updateWalletResult = UserWallet.incrementBalance(pointWallet.walletId, transaction.paymentAmount);
    if (updateWalletResult) {
      return updateWalletResult;
    } else {
      console.error(`updateWalletResult error pointWallet.walletId ${pointWallet.walletId} - ${JSON.stringify(transaction)}`);
      return undefined;
    }
  } else {
    console.error("approveDepositTransaction error");
    return undefined;
  }
}

async function denyDepositTransaction(transactionId, staff) {
  //get info of transaction
  let transaction = await DepositTransactionAccess.find({
    paymentDepositTransactionId: transactionId
  });

  if (!transaction || transaction.length < 1) {
    console.error("transaction is invalid");
    return undefined;
  }
  transaction = transaction[0];

  //N???u kh??ng ph???i giao d???ch "??ANG CH???" (PENDING / WAITING) ho???c "M???I T???O" (NEW) th?? kh??ng x??? l??
  if (!(transaction.status === DEPOSIT_TRX_STATUS.NEW || transaction.status === DEPOSIT_TRX_STATUS.WAITING || transaction.status !== DEPOSIT_TRX_STATUS.PENDING)) {
    console.error("deposit transaction was approved or canceled");
    return undefined;
  }

  //Change payment status and store info of PIC
  let updatedData = {
    paymentStatus: DEPOSIT_TRX_STATUS.CANCELED,
    paymentApproveDate: new Date(),
    paymentNote: `H??? th???ng t??? ?????ng t??? ch???i n???p ti???n`,
  }

  //if transaction was performed by Staff, then store staff Id for later check
  if (staff) {
    updatedData.paymentPICId = staff.staffId;
    updatedData.paymentNote = `${staff.firstName} ${staff.lastName} (id: ${staff.staffId}) t??? ch???i n???p ti???n`;
  }

  let updateResult = await DepositTransactionAccess.updateById(transactionId, updatedData);
  return updateResult;
}

//Th??m ti???n cho user v?? 1 s??? l?? do. V?? d??? ho??n t???t x??c th???c th??ng tin c?? nh??n
//N??n t???o ra 1 transaction ?????ng th???i l??u l???i lu??n v??o l???ch s??? ????? d??? ki???m so??t
async function addRewardPointForUser(appUserId, rewardAmount, staff, paymentNote) {
  let rewardWallet = await UserWallet.find({
    appUserId: appUserId,
    walletType: WALLET_TYPE.REWARD
  });

  if (rewardWallet === undefined || rewardWallet.length < 0) {
    console.error(`Can not find reward wallet to add point for user id ${appUserId}`)
    return undefined;
  }
  rewardWallet = rewardWallet[0];

  //T???o 1 transaction m???i v?? t??? ?????ng complete
  let newRewardTransaction = {
    paymentStatus: DEPOSIT_TRX_STATUS.COMPLETED,
    paymentApproveDate: new Date(),
    paymentNote: `H??? th???ng t??? ?????ng th?????ng - l?? do: ${paymentNote}`,
    appUserId: appUserId
  }

  //if transaction was performed by Staff, then store staff Id for later check
  if (staff) {
    newRewardTransaction.paymentPICId = staff.staffId;
    newRewardTransaction.paymentNote = `${staff.firstName} ${staff.lastName} (id: ${staff.staffId}) n???p ti???n th?????ng cho ng?????i d??ng`;
  }

  let insertResult = await DepositTransactionAccess.insert(newRewardTransaction);

  if (insertResult) {
    // t??? ?????ng th??m ti???n v??o v?? th?????ng c???a user
    await UserWallet.incrementBalance(rewardWallet.walletId, rewardAmount);
    return insertResult;
  } else {
    console.error(`can not create reward point transaction`);
    return undefined;
  }
}
module.exports = {
  createDepositTransaction,
  approveDepositTransaction,
  denyDepositTransaction,
  addRewardPointForUser,
}