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
    replyMessageEcho,
    replyMessage,
    pushMessage,
    processPostbackData,
    EventType,
    approveLeaveSub_web,
    approveLeaveSuper_web,
} from './lineUtils';
import {
    verifyToken
} from '../admin/auth';
import { ErrorWithCode } from '../utils/error';
import Config from '../config';

const router = express.Router();

router.post('/linewebhook', [
    body('events', 'events is required and should be array').isArray(),
], async(req, res, next) => {
    try {
        validationResult(req).throw();

        var event = req.body.events[0];
        switch (event.type){
            case EventType.MESSAGE:
                ;
            
            case EventType.POSTBACK:
                var data = event.postback.data;
                const postbackResult = await processPostbackData(data, event.source.userId);
                return res.send(postbackResult);
            
            case EventType.FOLLOW:
                var userId = event.source.userId;
                var replyToken = event.replyToken;
                let message = [{
                    type: "template",
                    altText: "請點選以綁定",
                    template: {
                        type: "buttons",
                        text: "請點選以綁定",
                        actions: [
                            {  
                                type:"uri",
                                label:"綁定",
                                uri:`line://app/${Config.liff.signInPage}`,
                                altUri: {
                                   "desktop" : "https://teddybear-dev.firebaseapp.com/signIn/desktop/"
                                }
                            }
                        ]
                    }
                }]
                let followResult = await replyMessage(replyToken, message);
                return res.send(followResult);

            default:
                throw(ErrorWithCode(`Unsupport event type:${event.type}`, 403));
        }   
    } catch (err) {
        next(err);
    }
});

router.post('/pushMessage', [
    body('userId', 'userId is required').isString(),
    body('messages', 'messages is required and should be array').isArray(),
    body('notificationDisabled', 'notificationDisabled should be bool').optional().isBoolean(),
], async(req, res, next) => {
    try {
        const { userId, messages, notificationDisabled } = req.body;
        pushMessage(userId, messages, notificationDisabled);
        return res.send("success");
    } catch (err) {
        next(err);
    }
});

router.post('/approveLeaveSub', [
    header('Authorization', 'idToken is required').isString(),
    body('ubn', 'ubn is required').isString(),
    body('leaveId', 'leaveId is required').isString(),
], async(req, res, next) => {
    try {
        const { ubn, leaveId } = req.body;
        validationResult(req).throw();
        const Authorization = req.headers.authorization; // idToken
        const uid = await verifyToken(Authorization);
        approveLeaveSub_web(ubn, leaveId);
        return res.send("success");
    } catch (err) {
        next(err);
    }
});

router.post('/approveLeaveSuper', [
    header('Authorization', 'idToken is required').isString(),
    body('ubn', 'ubn is required').isString(),
    body('leaveId', 'leaveId is required').isString(),
], async(req, res, next) => {
    try {
        const { ubn, leaveId } = req.body;
        validationResult(req).throw();
        const Authorization = req.headers.authorization; // idToken
        const uid = await verifyToken(Authorization);
        approveLeaveSuper_web(ubn, leaveId);
        return res.send("success");
    } catch (err) {
        next(err);
    }
});


export default router;
