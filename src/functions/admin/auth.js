import * as admin from 'firebase-admin';
import { ErrorWithCode } from '../utils/error';

export const checkUserExist = async (email) => {
    try {
        return await admin.auth().getUserByEmail(email);
    } catch (error) {
        console.log(`[AUTH] ${error}`);
        return false;
    }
}

export const verifyToken = async (token) => {
    try {
        let session = await admin.auth().verifyIdToken(token);
        return session.uid;
    } catch (error) {
        console.log(`[AUTH] ${error}`);
        if (error.code === 'auth/id-token-expired') {
            error = ErrorWithCode('SessionToken expired', 401);
        }
        throw(error);
    }
}

export const createUser = async (email, password, name) => {
    try {
        return await admin.auth().createUser({
            email,
            password,
            displayName: name,
        });
    } catch (error) {
        console.log(`[AUTH] ${error}`);
        throw(error);
    }
}

export const deleteUser = async (email) => {
    try {
        let user = await admin.auth().getUserByEmail(email);
        await admin.auth().deleteUser(user.uid);
    } catch (error) {
        console.log(`[AUTH] ${error}`);
        throw(error);
    }
}