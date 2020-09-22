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
    createDepartment ,
    getDepartment,
    updateLeave,
    updateDepartment
} from './department';

const router = express.Router();

router.post('/create', [
    header('Authorization', 'token is required').isString(),
    body('ubn', 'ubn is required').isString(),
    body('name', 'name is required and should be string').isString(),
    body('supervisor', 'supervisor ID is required and should be string').optional().isString(),
], async(req, res, next) => {
    
    const token = req.headers.authorization;
    try {
        validationResult(req).throw();
        const uid = await verifyToken(token);
        
        const { ubn, name, supervisor } = req.body;
        const department = {
            name: name,
            supervisor: supervisor
        }
        const response = await createDepartment(ubn, department);
        return res.send(response);
    } catch (err) {
        next(err);
    }
});

router.get('/target',[
    header('Authorization', 'idToken is required').isString(),
    query('ubn', 'ubn is required').isString(),
    query('departmentId', 'department ID is required').isString(),
], async(req, res, next) => {
    
    const token = req.headers.authorization;
    try {
        validationResult(req).throw();
        const uid = await verifyToken(token);

        const { ubn, departmentId } = req.query;
        let data = await getDepartment(ubn, departmentId);
        return res.send(data);
    } catch (err) {
        next(err);
    }
});

router.post('/update', [
    header('Authorization', 'idtoken is required').isString(),
    body('ubn', 'ubn is required').isString(),
    body('id', 'departmentId is required').isString(),
    body('name', 'name should be string').optional().isString(),
    body('supervisor', 'supervisor should be string').optional().isString(),
], async(req, res, next) => {
    
    try {
        validationResult(req).throw();
        const Authorization = req.headers.authorization;
        const uid = await verifyToken(Authorization);
        const { ubn, id, name, supervisor } = req.body;
        const response = await updateDepartment(ubn, id, req.body);
        return res.send(response);
    } catch (err) {
        next(err);
    }
});

export default router;