var express = require('express')
    , passport = require('passport')
    , util = require('util')
    , MicrosoftStrategy = require('passport-microsoft').Strategy;
var jwt_decode = require('jwt-decode');

const app = express()
const https = require('https');
const fs = require('fs');

app.use(passport.initialize());

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing. However, since this example does not
//   have a database of user records, the complete Microsoft graph profile is
//   serialized and deserialized.
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

const URLS = {
    WEBPHONE: 'https://10.1.1.45:3100',
    ADMIN: 'https://10.1.1.45:3100',
    REALTIME: 'https://10.1.1.45:3100',
};

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

let user = {};

passport.use(new MicrosoftStrategy({
    clientID: '1a55673e-08cb-4a78-ba5f-919a7add5741',
    clientSecret: 'oganizations',
    scope: ['user.read'],
    callbackURL: "https://10.1.1.45:3100/callback",
},
    function (accessToken, refreshToken, profile, done) {
        process.nextTick(() => {
            const decoded = jwt_decode(accessToken || refreshToken);
            if (!!decoded.signin_state && decoded.signin_state.find(i => i.indexOf('dvc_dmjd') > -1)) {
                user = profile._json;
                return done(null, user);
            } else {
                console.log({ accessToken, refreshToken, profile, done });
                return done('Usuário não pode se autenticar utilizando o método selecionado', {}, {});
            }
        });
        return user;
    }
));

app.get('/auth/microsoft', passport.authenticate('microsoft'),
    function (req, res) {
        console.log('req', req);
        console.log('res', res);
        res.send();
        // The request res.send('<p>Logged-in</p>'); will be redirected to Microsoft for authentication, so this
        // function will not be called.
    });

app.get('/home', passport.authenticate('microsoft', { successRedirect: '/success', failureRedirect: '/fail', passReqToCallback: true }), (req, res) => {
    console.log('req string', req.query)
    res.send('request' + '<pre>' + req.Body + '</pre>');
});

app.get('/login', passport.authenticate('microsoft', { successRedirect: '/success', failureRedirect: '/fail', passReqToCallback: true }), (req, res) => {
    console.log(req, res);
    res.send('<p>Logged-in</p>');
});

app.get('/callback', (req, res) => {
    console.log(req, res);
    res.status(200).send();
});

app.get('/relay', (req, res) => {
    res.send('<p>relay state</p>')
});

app.get('/logout', (req, res) => {
    res.send('<p>Logout</p>');
});

app.get('/fail', (req, res) => {
    res.send('<p>Fail login</?code=0.AAAAjO55fstGQE2A8k3b8MR1uD5nVRrLCHhKul-RmnrdV0E0AAA.AQABAAIAAAB2UyzwtQEKR7-rWbgdcBZIj27wNYWkcdEQwiNVB_NV34fsBicbk9rvnyU_ByNwfSurv_mEsx4KhnqJDN75iHzW8Xf8yFwmbFEztQfIl6J-ejJZF4wuyI69Je32tWXqwthsiA37hMLZpUcKxofaiOgGbzNXvxoJTtexXQ7wrWmpu5Mdkaz9If2kYxHfw5HHN3RYbYWCiUh8neH1-47BEqqFplkiVQmdyGdVRGVYCb-By-dhrG7644U8c1UJH_aSokEiMqlalO8fLj_m5QJ77J95JWWkwZSoLNN7BBW4bZuK-3ekLPH0lO8NPB_lUdx4YYHDO7ObsrUK1FcZQtdhv6zYNwKxf4aD3VqbdxgH1011aE-amgFmpoPV_60i3aqkZhfyE7pAnaBYM9ZCIgtMkw5iI5CnYKficPjdC4eVscq7SMfilouJYnfWThWNrChaIAe1SSPeyushQjaD1MJoZX3Y6EzEAL_iAXlnFx151XRsPnCZgOjlAxXvRo83IkKWp66UkDZkJkOX6jyh1IDpCs7iXce4rBFviTgxCzoOoSfNGynesaxHYY8SLjYbcD2_VTycSrfBPoq8z9jClNBY1xlHIAA&session_state=5c0b33f1-cb9c-4b5e-8bff-c9c728a21097p>');
});

app.get('/success', (req, res) => {
    res.send('<p>Success Login</p>');
});

app.use(passport.session());

const httpsServer = https.createServer({
    key: fs.readFileSync('./pkey.key'),
    cert: fs.readFileSync('./cert.crt'),
}, app);

httpsServer.listen(3100, () => {
    console.log('HTTPS Server running on port 3100');
});

// app.listen(3100, () => {
//     console.log(`Example app listening at http://localhost:${3100}`)
// })




process.stdin.resume();