import express from 'express';
import {
    check,
    validationResult,
    header,
    body,
    param,
    query
} from 'express-validator';
import {
    createPunch,
    getPunches,
    getTodayPunches
} from './punch';
import {
    verifyToken
} from '../admin/auth';
import {
    pushMessage
} from '../message/lineUtils'
import {
    ErrorWithCode
} from '../utils/error';

const router = express.Router();

router.post('/create', [
    header('Authorization', 'idToken is required').isString(),
    header('ubn', 'ubn is required').exists(),
    body('latitude', 'latitude is required').isLength({ min: 1 }),
    body('longitude', 'longitude is required').isLength({ min: 1 }),
    body('address', 'address is required').isLength({ min: 1 }),
    body('type', 'type is required').isLength({ min: 1 }),
    body('email', 'email is required').exists()
], async(req, res, next) => {
    try {
        validationResult(req).throw();
        const Authorization = req.headers.authorization; // idToken
        const uid = await verifyToken(Authorization);
        const ubn = req.headers.ubn;
        const response = await createPunch(ubn, req.body);
       
        return res.send(response);
    } catch (err) {
        next(err);
    }
});

router.get('/getToday',[
    header('Authorization', 'idtoken is required').isString(),
    query('ubn', 'ubn is required').isString(),
    query('query', 'query is required').optional().isString(),
    query('value', 'value is required').optional().isString(),
    query('page', 'page should be numberic').optional().isNumeric(),
    query('size', 'size should be numberic').optional().isNumeric(),
], async(req, res, next) => {
    try {
        validationResult(req).throw();
        const Authorization = req.headers.authorization; // idToken
        const uid = await verifyToken(Authorization);
        const {
            ubn,
            query,
            value,
            page,
            size
        } = req.query;
        let data = await getTodayPunches(ubn, query, value, page, size);
        return res.send(data);
    } catch (err) {
        next(err);
    }
});

router.get('/get',[
    header('Authorization', 'idtoken is required').isString(),
    query('ubn', 'ubn is required').isString(),
    query('query', 'query is required').optional().isString(),
    query('value', 'value is required').optional().isString(),
    query('page', 'page should be numberic').optional().isNumeric(),
    query('size', 'size should be numberic').optional().isNumeric(),
], async(req, res, next) => {
    try {
        validationResult(req).throw();
        const Authorization = req.headers.authorization; // idToken
        const uid = await verifyToken(Authorization);
        const {
            ubn,
            query,
            value,
            page,
            size
        } = req.query;
        let data = await getPunches(ubn, query, value, page, size);
        return res.send(data);
    } catch (err) {
        next(err);
    }
});

export default router;