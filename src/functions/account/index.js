import express from 'express';
import {
    check,
    validationResult,
    body,
    param,
    query,
    header
} from 'express-validator';
import {
    verifyToken
} from '../admin/auth';
import { 
    checkPermission,
    role
} from '../admin/permission';
import {
    createAccount,
    updateAccount,
    getAccount,
    getAccounts
} from './account';

const router = express.Router();

router.post('/create', [
    header('Authorization', 'token is required').isString(),
    body('name', 'name is required').isString(),
    body('ubn', 'ubn is required').isNumeric(),
    body('address', 'address is required').isString(),
    body('phone', 'phone is required').isString(),
    body('useGoogleSignIn', 'useGoogleSignIn is required and should be boolean').isBoolean(),
    body('email', 'email is required').isEmail(),
    body('password', 'password is required and should be string').isString(),
], async(req, res, next) => {

    const token = req.headers.authorization;
    try {
        validationResult(req).throw();

        const uid = await verifyToken(token);
        await checkPermission(uid, role.ADMIN);

        const response = await createAccount(req.body);
        return res.send(response);
    } catch (err) {
        next(err);
    }
});

router.post('/update', [
    header('Authorization', 'token is required').isString(),
    query('ubn', 'ubn is required').isNumeric(),
    body('ubn', 'ubn cannot change').isEmpty(),
    body('useGoogleSignIn', 'useGoogleSignIn cannot change').isEmpty(),
    body('email', 'email cannot change').isEmpty(),
    body('status', 'status should be numeric').optional().isNumeric(),
    body('status', 'status should not be string').optional().not().isString(),
], async(req, res, next) => {

    const token = req.headers.authorization;
    try {
        validationResult(req).throw();

        const uid = await verifyToken(token);
        await checkPermission(uid, role.ADMIN);
        
        const { ubn } = req.query;
        const response = await updateAccount(ubn, req.body);
        return res.send(response);
    } catch (err) {
        next(err);
    }
});

router.get('/target', [
    header('Authorization', 'token is required').isString(),
    query('ubn', 'ubn is required').isNumeric(),
], async(req, res, next) => {
    
    const token = req.headers.authorization;
    try {
        validationResult(req).throw();
        
        const uid = await verifyToken(token);
        await checkPermission(uid, role.ADMIN);
        
        const { ubn } = req.query;

        let data = await getAccount(ubn);
        return res.send(data);
    } catch (err) {
        next(err);
    }
});

router.get('/search',[
    header('Authorization', 'token is required').isString(),
    query('ubn', 'ubn wrong format').optional().isNumeric(),
    query('page', 'page should be numberic').optional().isNumeric(),
    query('size', 'size should be numberic').optional().isNumeric(),
], async(req, res, next) => {
    
    const token = req.headers.authorization;
    try {
        validationResult(req).throw();
        
        const uid = await verifyToken(token);
        await checkPermission(uid, role.ADMIN);
        
        const {
            ubn,
            page,
            size
        } = req.query;
        let data = await getAccounts(ubn, page, size);
        return res.send(data);
    } catch (err) {
        next(err);
    }
});

export default router;