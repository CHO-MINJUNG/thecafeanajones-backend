exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.send({"message":"로그인이 필요합니다", "isDenied": true});
    }
  };
  
exports.isNotLoggedIn = (req, res, next) => {
  console.log(req);
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.send({"message":"로그인한 상태입니다"})
  }
};