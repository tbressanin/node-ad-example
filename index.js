var passport = require('passport');
var express = require('express');
var MicrosoftStrategy = require('passport-microsoft').Strategy;
const app = express()
const https = require('https');
const fs = require('fs');
app.use(passport.initialize());

const URLS = {
    WEBPHONE: 'https://10.1.1.45:3100',
    ADMIN: 'https://10.1.1.45:3100',
    REALTIME: 'https://10.1.1.45:3100',
};

passport.use(new MicrosoftStrategy({
    clientID: '1a55673e-08cb-4a78-ba5f-919a7add5741',
    // clientSecret: 'R1xdotuiwBq.-20k4zpX-8v0i.-U-bOhlQ',
    clientSecret: 'hj5qu0-x4fIsy0vA6Ny-zV._1_.djLNbbn',
    callbackURL: "https://10.1.1.45:3100/callback",
    scope: ['user.read'],
    pkce: false
},
    function (accessToken, refreshToken, profile, done) {
        console.log({ accessToken, refreshToken, profile, done });
        process.nextTick(function () {
            // To keep the example simple, the user's Microsoft Graph profile is returned to
            // represent the logged-in user. In a typical application, you would want
            // to associate the Microsoft account with a user record in your database,
            // and return that user instead.
            return done(null, profile);
        });
        // User.findOrCreate({ userId: profile.id }, function (err, user) {
        //   return done(err, user);
        // });
    }
));

app.get('/auth/microsoft',
    passport.authenticate('microsoft'),
    function (req, res) {
        // The request will be redirected to Microsoft for authentication, so this
        // function will not be called.
    });

app.get('/home', passport.authenticate('microsoft', { successRedirect: '/', failureRedirect: '/login?fail=true', }), (req, res) => {
    console.log('req string', req.query)
    res.send('request' + '<pre>' + req.Body + '</pre>');
});

app.get('/test', ensureAuthenticated, function (req, res) {
    res.render('account', { user: req.user });
})

app.get('/callback', (req, res) => {
    console.log(req, res);
    res.send('<p>Logged-in</p>');
});

app.get('/auth', (req, res) => {
    console.log(req, res);
    res.redirect('/success');
});

app.get('/relay', (req, res) => {
    res.send('<p>relay state</p>')
});

app.get('/logout', (req, res) => {
    res.send('<p>Logout</p>');
});

app.get('/chat', (req, res) => {
    return '<p>Logged-in</p>'
});


app.use(passport.session());


const httpsServer = https.createServer({
    key: fs.readFileSync('./pkey.key'),
    cert: fs.readFileSync('./cert.crt'),
}, app);


httpsServer.listen(3100, () => {
    console.log('HTTPS Server running on port 3100');
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login')
}


// app.listen(3100, () => {
//     console.log(`Example app listening at http://localhost:${3100}`)
// })
process.stdin.resume();