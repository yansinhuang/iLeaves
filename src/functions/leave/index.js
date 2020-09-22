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
    createLeave,
    getLeave,
    getLeaves,
    sendMessages,
    updateLeave
} from './leave';
import {
    verifyToken
} from '../admin/auth';
import {
    pushMessage
} from '../message/lineUtils'
import {
    getStaff
} from '../staff/staff'
import {
    getDepartment
} from '../department/department'
import {
    ErrorWithCode
} from '../utils/error';

const router = express.Router();

router.post('/create', [
    header('Authorization', 'idToken is required').isString(),
    header('ubn', 'ubn is required').exists(),
    header('userId', 'userId is required').exists(),
    body('startDate', 'startDate is required').isLength({ min: 1 }),
    body('endDate', 'endDate is required').isLength({ min: 1 }),
    body('leaveType', 'leaveType is required').isLength({ min: 1 }),
    body('leaveReason', 'leaveReason is required').isLength({ min: 1 }),
    body('substitute', 'substitute is required').isLength({ min: 1 }),
    body('email', 'email is required').exists()
], async(req, res, next) => {
    try {
        validationResult(req).throw();
        const Authorization = req.headers.authorization; // idToken
        const ubn = req.headers.ubn;
        const userId = req.headers.userid;
        const uid = await verifyToken(Authorization);
        const selfStaff = await getStaff(ubn, req.body.email);
        const department = await getDepartment(ubn, selfStaff.department);
        req.body.status = "等待簽核";
        req.body.rejectReason = null;
        req.body.supervisor = department.supervisor;
        const response = await createLeave(ubn, req.body);
        await sendMessages(ubn, userId, response);       
        return res.send(response);
    } catch (err) {
        next(err);
    }
});

router.get('/target',[
    header('Authorization', 'token is required').isString(),
    query('ubn', 'ubn is required').isString(),
    query('id', 'leaveId is required').isString(),
], async(req, res, next) => {
    
    const token = req.headers.authorization;
    try {
        validationResult(req).throw();
        const uid = await verifyToken(token);
        const { ubn, id } = req.query;
        let data = await getLeave(ubn, id);
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
        let data = await getLeaves(ubn, query, value, page, size);
        return res.send(data);
    } catch (err) {
        next(err);
    }
});

router.post('/update', [
    header('Authorization', 'idtoken is required').isString(),
    body('status', 'status should be string').optional().isString(),
    body('rejectReason', 'rejectReason should be string').optional().isString(),
    body('ubn', 'ubn is required').isString(),
    body('leaveId', 'leaveId is required').isString(),
], async(req, res, next) => {
    
    try {
        validationResult(req).throw();
        const Authorization = req.headers.authorization;
        const uid = await verifyToken(Authorization);
        const { status, rejectReason, ubn, leaveId } = req.body;
        if ((status == "拒絕 (代理人)" || "拒絕 (主管)") && (rejectReason == "" || null)) {
            console.log('請填寫拒絕原因');
            throw(ErrorWithCode('請填寫拒絕原因'));
        }
        const response = await updateLeave(ubn, leaveId, req.body);
        return res.send(response);
    } catch (err) {
        next(err);
    }
});

export default router;