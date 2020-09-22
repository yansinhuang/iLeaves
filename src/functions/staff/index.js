import express from 'express';
import {
    check,
    validationResult,
    body,
    header,
    param,
    query
} from 'express-validator';
import {
    verifyToken
} from '../admin/auth';
import {
    createStaff,
    updateStaff,
    getStaff,
    deleteStaff,
    getStaffs,
    signin,
    createLUser,
    getLUser,
    checkExistLUser,
    verifyLineToken,
    generateCustomToken,
    getSubstitutes,
    signInWithCustomToken,
    signOut
} from './staff';
import {
    ErrorWithCode
} from '../utils/error';
import {
    switchMenuTo
} from '../message/lineUtils';
import Config from '../config';
const router = express.Router();

router.post('/create', [
    header('Authorization', 'token is required').isString(),
    body('name', 'Name is required and should be string').isString(),
    body('english', 'English Name is required and should be string').optional().isString(),
    body('email', 'please enter a valid email').isEmail(),
    body('department', 'department ID is required and should be string').isString(),
    body('position', 'position is required and should be string').isString(),
    body('onBoardDate', 'onBoardDate is required and should be string').isString(),
    body('password', 'password is required and should be string').isString(),
    body('ubn', 'ubn is required').isString(),
], async(req, res, next) => {
    
    const token = req.headers.authorization;
    try {
        validationResult(req).throw();
        const uid = await verifyToken(token);
        const { ubn } = req.body;
        const response = await createStaff(ubn, req.body);
        return res.send(response);
    } catch (err) {
        next(err);
    }
});

router.post('/update', [
    header('Authorization', 'token is required').isString(),
    body('chineseName', 'chineseName should be string').optional().isString(),
    body('englishName', 'englishName should be string').optional().isString(),
    body('department', 'department should be string').optional().isString(),
    body('position', 'position should be string').optional().isString(),
    body('onBoardDate', 'onBoardDate should be string').optional().isString(),
    body('password', 'password cannot be changed here').isEmpty(),
    body('ubn', 'ubn is required').isString(),
    body('email', 'email is required').isEmail(),
], async(req, res, next) => {

    const token = req.headers.authorization;
    try {
        validationResult(req).throw();
        const uid = await verifyToken(token);
        const { ubn, email } = req.body;
        const response = await updateStaff(ubn, email, req.body);
        return res.send(response);
    } catch (err) {
        next(err);
    }
});

router.get('/target',[
    header('Authorization', 'token is required').isString(),
    query('ubn', 'ubn is required').isString(),
    query('email', 'email is required').isEmail(),
], async(req, res, next) => {
    
    const token = req.headers.authorization;
    try {
        validationResult(req).throw();
        const uid = await verifyToken(token);
        const { email, ubn } = req.query;
        let data = await getStaff(ubn, email);
        return res.send(data);
    } catch (err) {
        next(err);
    }
});

router.delete('/target',[
    header('Authorization', 'token is required').isString(),
    query('ubn', 'ubn is required').isString(),
    query('email', 'email is required').isEmail(),
], async(req, res, next) => {
    
    const token = req.headers.authorization;
    try {
        validationResult(req).throw();
        const uid = await verifyToken(token);
        const { ubn, email } = req.query;
        let data = await deleteStaff(ubn, email);
        return res.send(data);
    } catch (err) {
        next(err);
    }
});

router.get('/search',[
    header('Authorization', 'token is required').isString(),
    query('ubn', 'ubn is required').isString(),
    query('email', 'email wrong format').optional().isEmail(),
    query('page', 'page should be numberic').optional().isNumeric(),
    query('size', 'size should be numberic').optional().isNumeric(),
], async(req, res, next) => {
    
    const token = req.headers.authorization;
    try {
        validationResult(req).throw();
        
        const uid = await verifyToken(token);
        
        const {
            ubn,
            email,
            page,
            size
        } = req.query;
        let data = await getStaffs(ubn, email, page, size);
        return res.send(data);
    } catch (err) {
        next(err);
    }
});

router.get('/getSubstitutes',[
    header('Authorization', 'token is required').isString(),
    query('ubn', 'ubn is required').isString(),
    query('query', 'query is required').optional().isString(),
    query('value', 'value is required').optional().isString(),
    query('page', 'page should be numberic').optional().isNumeric(),
    query('size', 'size should be numberic').optional().isNumeric(),
], async(req, res, next) => {
    
    const token = req.headers.authorization;
    try {
        validationResult(req).throw();
        
        const uid = await verifyToken(token);
        
        const {
            ubn,
            query,
            value,
            page,
            size
        } = req.query;
        let data = await getSubstitutes(ubn, query, value, page, size);
        return res.send(data);
    } catch (err) {
        next(err);
    }
});

router.post('/signIn', [
    body('ubn', 'ubn is required and should be string').isString(),
    body('email', 'email is required').isEmail(),
    body('password', 'password is required and should be string').isString(),
    body('userId', 'userId is required and should be string').isString(),
], async(req, res, next) => {

    try {
        validationResult(req).throw();
        const { ubn, email, password , userId} = req.body;
        const response = await signin(ubn, email, password);
        // switch menu
        switchMenuTo(userId, Config.richmenu.MAIN);
        // check exist
        let isExist = await checkExistLUser(userId);
        if (isExist) throw(ErrorWithCode('Already connected'));
        
        const body = {
            "ubn": ubn,
            "email": email,
            "userId": userId 
        }
        // save userId in Account
        updateStaff(ubn, email, body);
        // save userId in LUser
        createLUser(userId, body);

        return res.send(response);
    } catch (err) {
        next(err);
    }
});

router.post('/signInOnly', [
    body('ubn', 'ubn is required and should be string').isString(),
    body('email', 'email is required').isEmail(),
    body('password', 'password is required and should be string').isString(),
], async(req, res, next) => {

    try {
        validationResult(req).throw();
        const { ubn, email, password} = req.body;
        const response = await signin(ubn, email, password);
        return res.send(response);
    } catch (err) {
        next(err);
    }
});

// for front-end use
router.post('/checkExist', [
    body('userId', 'userId is required and should be string').isString()
], async(req, res, next) => {
    try {
        validationResult(req).throw();
        const { userId } = req.body;
        let isExist = await checkExistLUser(userId);
        return res.send(isExist);
    } catch (err) {
        next(err);
    }
});

router.post('/lineAuth', [
    body('accessToken', 'accessToken is required').exists(),
    body('userId', 'userId is required').exists(),
], async (req, res, next) => {

    try {
        validationResult(req).throw();
        const { accessToken, userId } = req.body;
        const verified = await verifyLineToken(accessToken);
        if (verified) {
            const LUser = await getLUser(userId);
            const FIRUser = await getStaff(LUser.ubn, LUser.email);
            const token = await generateCustomToken(FIRUser.uid);
            const idToken = await signInWithCustomToken(token);
            return res.status(200).send({'token': idToken, 'staff': FIRUser});
        }
        return res.status(200).send(verified);
    } catch (err) {
        if (err.mapped) {
            err.message = err.mapped();
        }
        next(err);
    }
  });
/*
router.post('/signOut', [
    body('ubn', 'ubn is required and should be string').isString(),
    body('email', 'email is required').isEmail()
], async(req, res, next) => {

    try {
        validationResult(req).throw();
        const { ubn, email} = req.body;
        const response = await signOut(ubn, email);
        
        return res.send(response);
    } catch (err) {
        next(err);
    }
}); 
*/
router.post('/signOut', [
    body('userId', 'userId is required and should be string').isString()
], async(req, res, next) => {

    try {
        validationResult(req).throw();
        const { userId } = req.body;
        const response = await signOut(userId);
        
        return res.send(response);
    } catch (err) {
        next(err);
    }
}); 

export default router;