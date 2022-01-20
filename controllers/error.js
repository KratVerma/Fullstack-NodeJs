exports.get404Error = (req, res, next) => {
    res.status(404).render('error',
        {
            pageTitle: '404 Page not Found',
            path: '/404',
            isAuthenticated: req.session.isLoggedIn,
        });
};

exports.get500Error = (req, res, next) => {
    res.status(500).render('500',
        {
            pageTitle: 'Error!',
            path: '/500',
            isAuthenticated: req.session.isLoggedIn,
        });
};