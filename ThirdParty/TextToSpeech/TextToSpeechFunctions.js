const TextToSpeechClient = require('./TextToSpeechClient');

///+ Biển số nền màu xanh, chữ và số màu trắng, sêri biển số sử dụng lần lượt một trong 11 chữ cái sau đây: A, B, C, D,
/// E, F, G, H, K, L, M cấp cho xe của các cơ quan của Đảng; Văn phòng Chủ tịch nước; Văn phòng Quốc hội và các cơ quan
/// của Quốc hội; Văn phòng Đoàn đại biểu Quốc hội, Hội đồng nhân dân các cấp; các Ban chỉ đạo Trung ương; Công an nhân
/// dân, Tòa án nhân dân, Viện kiểm sát nhân dân…;
///
///+ Biển số nền màu xanh, chữ và số màu trắng có ký hiệu “CD” cấp cho xe máy chuyên dùng của lực lượng Công an nhân dân
/// sử dụng vào mục đích an ninh;
///
///+ Biển số nền màu trắng, chữ và số màu đen, sêri biển số sử dụng lần lượt một trong 20 chữ cái sau đây: A, B, C, D,
/// E, F, G, H, K, L, M, N, P, S, T, U, V, X, Y, Z cấp cho xe của cá nhân, xe của doanh nghiệp, các tổ chức xã hội, xã
/// hội - nghề nghiệp, xe của đơn vị sự nghiệp ngoài công lập, xe của Trung tâm đào tạo sát hạch lái xe công lập;
///
///+ Biển số nền màu vàng, chữ và số màu đỏ, có ký hiệu địa phương đăng ký và hai chữ cái viết tắt của khu kinh tế -
/// thương mại đặc biệt, khu kinh tế cửa khẩu quốc tế, cấp cho xe của khu kinh tế - thương mại đặc biệt hoặc khu kinh tế
/// cửa khẩu quốc tế;
///
///+ Biển số nền màu vàng, chữ và số màu đen sêri biển số sử dụng lần lượt một trong 20 chữ cái sau đây: A, B, C, D, E,
/// F, G, H, K, L, M, N, P, S, T, U, V, X, Y, Z cấp cho xe hoạt động kinh doanh vận tải (quy định mới).
const c_valid_char = "A,B,C,D,E,F,G,H,K,L,M,N,P,R,S,T,U,V,X,Y,Z".split(",");
const c_valid_specialChar = "KT,LD,DA,MK,MD,MĐ,TD,TĐ,HC,NG,QT,NN,CV,CD,LB".split(",");

function getSpeechesUrls(plateNumber) {
  const speeches = [];
  let characters = plateNumber.split('');

  //Add welcome speech
  speeches.push(`https://${process.env.HOST_NAME}/uploads/voices/welcome.mp3`);

  //Check if plate start with 2 digits
  let doubleChar = "0";
  if (characters.length > 2) {
    doubleChar = `${characters[0]}${characters[1]}`;
  }
  let charCounter = 0;
  if (parseInt(doubleChar) >= 10) {
    speeches.push(`https://${process.env.HOST_NAME}/uploads/voices/alphabets/${doubleChar}.mp3`);
    charCounter = 2;
  }

  //Remaining characters will be add sequentially 
  for (let i = charCounter; i < characters.length; i++) {
    const charString = characters[i].toUpperCase();
    let speechFile = `https://${process.env.HOST_NAME}/uploads/voices/alphabets/${charString}.mp3`;

    speeches.push(speechFile);
  }
  return speeches;
}

async function createProcessSpeechFile(processString, fileName) {
  let result = await TextToSpeechClient.makeSpeechFile(processString, fileName);
  return result;
}

async function resetDefaultSpeechFile() {
  await TextToSpeechClient.remakeAllAlphabets();
  return "ok";
}

module.exports = {
  getSpeechesUrls,
  createProcessSpeechFile,
  resetDefaultSpeechFile
};
