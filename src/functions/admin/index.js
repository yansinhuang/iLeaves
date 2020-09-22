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
} from './auth';
import {
    checkPermission,
    role
} from './permission'
import {
    createAdmin,
    updateAdmin,
    getAdmin,
    getAdminById,
    getAdmins,
    signin,
    getRoles,
    resetPassword,
    deleteAdmin,
    refreshToken
} from './admin';

const router = express.Router();

router.post('/create', [
    header('Authorization', 'token is required').isString(),
    body('name', 'name is required and should be string').isString(),
    body('email', 'email is required').isEmail(),
    body('password', 'password is required and should be string').isString(),
    body('role', 'role is required and should be numeric').isNumeric(),
], async(req, res, next) => {

    const token = req.headers.authorization;
    try {
        validationResult(req).throw();
        
        const uid = await verifyToken(token);
        await checkPermission(uid, role.SUPER_ADMIN);

        const response = await createAdmin(req.body);
        return res.send(response);
    } catch (err) {
        next(err);
    }
});

router.post('/update/:email', [
    header('Authorization', 'token is required').isString(),
    body('email', 'email cannot change').isEmpty(),
    body('role', 'role should be numeric').optional().isNumeric(),
    body('role', 'role should not be string').optional().not().isString(),
], async(req, res, next) => {

    const token = req.headers.authorization;
    try {
        validationResult(req).throw();

        const uid = await verifyToken(token);
        await checkPermission(uid, role.ADMIN);

        const email = req.path.split('/').pop();
        const response = await updateAdmin(email, req.body);
        return res.send(response);
    } catch (err) {
        next(err);
    }
});

router.get('/target',[
    header('Authorization', 'token is required').isString(),
    query('email', 'email is required').isEmail(),
], async(req, res, next) => {
    
    const token = req.headers.authorization;
    try {
        validationResult(req).throw();
        
        const uid = await verifyToken(token);
        await checkPermission(uid, role.ADMIN);

        const { email } = req.query;
        
        let data = await getAdmin(email);
        return res.send(data);
    } catch (err) {
        next(err);
    }
});

router.get('/search',[
    header('Authorization', 'token is required').isString(),
    query('email', 'email wrong format').optional().isEmail(),
    query('page', 'page should be numberic').optional().isNumeric(),
    query('size', 'size should be numberic').optional().isNumeric(),
], async(req, res, next) => {
    
    const token = req.headers.authorization;
    try {
        validationResult(req).throw();
        
        const uid = await verifyToken(token);
        await checkPermission(uid, role.ADMIN);
        
        const {
            email,
            page,
            size
        } = req.query;
        let data = await getAdmins(email, page, size);
        return res.send(data);
    } catch (err) {
        next(err);
    }
});

router.post('/signin', [
    body('email', 'email is required').isEmail(),
    body('password', 'password is required and should be string').isString(),
], async(req, res, next) => {

    try {
        validationResult(req).throw();
        const { email, password } = req.body;
        
        const response = await signin(email, password);
        return res.send(response);
    } catch (err) {
        next(err);
    }
});

router.get('/roles',[
    header('Authorization', 'token is required').isString(),
], async(req, res, next) => {
    
    const token = req.headers.authorization;
    try {
        validationResult(req).throw();
        
        await verifyToken(token);
        
        let data = await getRoles();
        return res.send(data);
    } catch (err) {
        next(err);
    }
});

router.put('/password', [
    header('Authorization', 'token is required').isString(), 
], async(req, res, next) => {
    const token = req.headers.authorization;
    try {
        validationResult(req).throw();
        
        let uid = await verifyToken(token);
        await checkPermission(uid, role.ADMIN);

        let admin = await getAdminById(uid);
        let data = await resetPassword(admin.email);
        return res.send(data);
    } catch (err) {
        next(err);
    }
});

router.delete('/target',[
    header('Authorization', 'token is required').isString(),
    query('email', 'email is required').isEmail(),
], async(req, res, next) => {
    
    const token = req.headers.authorization;
    try {
        validationResult(req).throw();
        
        const uid = await verifyToken(token);
        await checkPermission(uid, role.SUPER_ADMIN);

        const { email } = req.query;
        
        let data = await deleteAdmin(email);
        return res.send(data);
    } catch (err) {
        next(err);
    }
});

router.put('/refreshToken', [
    header('Authorization', 'token is required').isString(),
    body('refresh', 'refresh is required').isString(),
], async(req, res, next) => {

    const token = req.headers.authorization;
    try {
        validationResult(req).throw();
        await verifyToken(token);

        const {
            refresh
        } = req.body;

        let data = await refreshToken(refresh);
        return res.send(data);
    } catch (err) {
        next(err);
    }
});

export default router;