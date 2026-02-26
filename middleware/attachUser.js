const User = require("../models/User");

module.exports = async function attachUser(req, res, next) {
  const { uid, email } = req.user;

  let user = await User.findOne({ uid });

  if (!user) {
    user = await User.create({ uid, email });
  }

  req.dbUser = user;
  next();
};
