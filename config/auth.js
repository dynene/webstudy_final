module.exports = {
    ensureAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', '이 페이지를 보기 위해서는 먼저 로그인하세요.');
        res.redirect('/users/login');
    }
}