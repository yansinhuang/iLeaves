import * as functions from "firebase-functions";
import * as fbAdmin from 'firebase-admin';
import express from "express";
import cors from "cors";
import bodyParser from 'body-parser';
import Config from './config';

import message from './message';
import account from './account';
import admin from './admin';
import test from './test';
import staff from './staff';
import leave from './leave';
import department from './department';
import punch from './punch';

// Initialize firebase
fbAdmin.initializeApp({
    credential: fbAdmin.credential.cert(Config.credential),
    databaseURL: Config.firebase.databaseURL
});

// Initialize http-server
const app = new express();
app.use(cors({ origin: true }));
app.use(bodyParser.urlencoded({
    extended: false
}))

// Setup json parser
app.use(bodyParser.json());

exports.api = functions.https.onRequest(app);

// Binding path
app.use('/test/', test);
app.use('/message/', message);
app.use('/account/', account);
app.use('/admin/', admin);
app.use('/staff/', staff);
app.use('/leave/', leave);
app.use('/department/', department);
app.use('/punch/', punch);

// Routes
app.get('*', (req, res) => {
    res.send(`ezBot API Entry(${Config.env})`);
});

app.post('*', (req, res) => {
    res.send(`ezBot API Entry(${Config.env})`);
});

app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

function clientErrorHandler(err, req, res, next) {

    if (req.xhr) {
        res.status(500).send({
            err: '[ezBot] Unknown Error!'
        });
    } else {
        next(err);
    }
}

function logErrors(err, req, res, next) {
    if (err.mapped) {
        err.message = err.mapped();
    }
    if (err.stack) {
        console.error('err code: ', err.code, '\nstack:', err.stack);
    }
    if (err.message) {
        console.error('err code: ', err.code, '\nmessage:', err.message);
    }
    next(err);
}

function errorHandler(err, req, res, next) {
    let status = err.code || 500;
    if (status.toString().length > 3) {
        status = status.toString().subString(0, 3);
    }
    res.status(status);
    res.send({
        status,
        errors: {
            message: err.message,
            code: err.code
        }
    });
}