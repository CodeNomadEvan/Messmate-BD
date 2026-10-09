const Mess = require("./Mess");

async function getMessById(id) {
  return await Mess.findById(id);
}

async function getMessByCode(code) {
  return await Mess.findOne({ messCode: code });
}

async function createMess(data) {
  return await Mess.create(data);
}

async function updateMess(id, data) {
  return await Mess.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
}

async function getMessWithManagerCode(code) {
  return await Mess.findOne({ messCode: code });
}

module.exports = {
  getMessById,
  getMessByCode,
  createMess,
  updateMess,
  getMessWithManagerCode,
};
