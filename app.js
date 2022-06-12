const path = require('path');

const exp = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongodbStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');


const errorController = require('./controllers/error');
const User = require('./models/user');


const MONGODB_URI = '####################';


const app = exp();
const store = new MongodbStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now();
        cb(null, file.fieldname + '-' + uniqueSuffix + '.png');
    },
});

const filter = (req, file, cb) => {

    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
// app.use(multer({ storage: fileStorage }).single('image'));
app.use(multer({ storage: fileStorage, fileFilter: filter }).single('image'));

app.use(exp.static(path.join(__dirname, 'public')));
app.use('/images', exp.static(path.join(__dirname, 'images')));
app.use(
    session({
        secret: 'mysecretkeyvalue',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            throw new Error(err);
        });
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);


app.get('/500', errorController.get500Error);
app.use(errorController.get404Error);
app.use((error, req, res, next) => {
    console.log('Going through the error middleware!', 'checkout wale se jaa raha', error);
    res.redirect('/500');
});

mongoose.connect(MONGODB_URI, { useUnifiedTopology: true })
    .then(result => {
        console.log('Connected!');
        app.listen(3000);
    })
    .catch(err => console.log(err));