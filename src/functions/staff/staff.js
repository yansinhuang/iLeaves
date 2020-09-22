import {
    checkExist,
    create,
    update,
    fetch,
    remove,
    searchEmail,
    search
} from '../db/staff';
import * as LUser from '../db/LUser';
import httpClient from '../utils/httpClient';
import Config from '../config';
import {
    createUser,
    checkUserExist,
    deleteUser
} from '../admin/auth';
import {
    ErrorWithCode
} from '../utils/error';
import {
    partialUpdateObject
} from '../utils/partialUpdate';
import * as admin from 'firebase-admin';
import { user } from 'firebase-functions/lib/providers/auth';
import {
    switchMenuTo
} from '../message/lineUtils';

const VERIFY_TOKEN_URL = 'https://api.line.me/oauth2/v2.1/verify'
export const createStaff = async (ubn, staff) => {
    try { 
        const { email, password, chineseName } = staff;
        // auth
        let isExist = await checkUserExist(email);
        if (isExist) throw(ErrorWithCode('Account is already create in Authentication:' + email));
        // database
        isExist = await checkExist(staff.ubn, email);
        if (isExist) throw(ErrorWithCode('Account is already create in Database:' + email));
        const user = await createUser(email, password, chineseName);
        
        staff.uid = user.uid;
        delete staff.password;
        const result = await create(ubn, staff);
        return result;
    } catch(err) {
        throw(err)
    }
}

export const updateStaff = async (ubn, email, updateData) => {
    try {
        let data = await fetch(ubn, email);
        if (!data) throw(ErrorWithCode('Account is not create:' + email));
        
        const supportFields = [
            'name',
            'english',
            'department',
            'position',
            'onBoardDate',
            'userId'
        ];
        data = partialUpdateObject(data, updateData, supportFields);
        return await update(ubn, data);
    } catch(err) {
        throw(err);
    }
}

export const getStaff = async (ubn, email) => {
    try {
        let data = await fetch(ubn, email);
        if (!data) throw(ErrorWithCode('Account is not create:' + email));
        
        return {
            "name": data.name,
            "english": data.english,
            "email": data.email,
            "department": data.department,
            "position": data.position,
            "onBoardDate": data.onBoardDate,
            "uid": data.uid,
            "createTime": data.createTime,
            "lastUpdate": data.lastUpdate,
            "ubn": data.ubn,
            "userId": data.userId,
        };
    } catch(err) {
        throw(err);
    }
}

export const deleteStaff = async (ubn, email) => {
    try {
        let data = await fetch(ubn, email);
        if (!data) throw(ErrorWithCode('Account is not create:' + email));

        await deleteUser(email);
        return await remove(ubn, email);
    } catch (err) {
        throw(err);
    }
}

export const getStaffs = async (ubn, email, page = 0, size = 10) => {
    try {
        let datas = await searchEmail(ubn, email, page, size);
        return datas;
    } catch (err) {
        throw(err);
    }
}

export const getSubstitutes = async (ubn, query, value, page = 0, size = 100) => {
    try {
        let datas = await search(ubn, query, value, page, size);
        return datas;
    } catch (err) {
        throw(err);
    }
}

export const signin = async (ubn, email, password) => {
    try {
        const url = `${Config.firebase.authUrl}/accounts:signInWithPassword?key=${Config.firebase.apiKey}`;
        const result = await httpClient.postjson(url, {
            ubn,
            email, 
            password,
            returnSecureToken: true
        });
        let staff = await getStaff(ubn, email);
        staff.sessionToken = result.idToken;
        staff.refreshToken = result.refreshToken;
        
        return staff;
    } catch (err) {
        throw(err);
    }
}

export const signInWithCustomToken = async(token) =>{
    try{
        const url = `${Config.firebase.authUrl}/accounts:signInWithCustomToken?key=${Config.firebase.apiKey}`;
        const result = await httpClient.postjson(url, {
            token,
            returnSecureToken: true
        });
        const response = {idToken: result.idToken, refreshToken: result.refreshToken}
        return response;
    } catch (err) {
        throw(err);
    }
}

export const createLUser = async (userId, data) => {
    try { 
        const result = await LUser.create(userId, data);
        return result;
    } catch(err) {
        throw(err)
    }
}

export const getLUser = async (userId) => {
    try { 
        const result = await LUser.get(userId);
        return result;
    } catch(err) {
        throw(err)
    }
}

export const getFBUser = async (userId) => {
    try{
        const LUser = await getLUser(userId);
        const ubn = LUser.ubn;
        const email = LUser.email;
        const FBUser = await getStaff(ubn, email);
        return FBUser;
    } catch(err) {
        throw(err)
    }
}

export const checkExistLUser = async (userId, data) => {
    try { 
        const result = await LUser.checkExist(userId);
        return result;
    } catch(err) {
        throw(err)
    }
}

export const verifyLineToken = async (accessToken) => {
    try {
        let param = {
            'access_token': accessToken
        }
        const response = await httpClient.get(VERIFY_TOKEN_URL, param);
        if (response.client_id !== Config.line.channelId) {
            throw(response);
        }
        return true;
    } catch(err) {
        throw(err)
    }
  }

export const generateCustomToken = async (uid) => {
    return new Promise((resolve, reject) => {
        admin.auth().createCustomToken(uid)
        .then( token => {
            resolve(token);
        })
        .catch( error => {
            reject(err);
        });
    });
  }
/*
export const signOut = async (ubn, email) => {
    try {
        let staff = await getStaff(ubn, email);
        let userId = staff.userId;
        let result = await LUser.remove(ubn, userId);
        // switch menu
        switchMenuTo(userId, Config.richmenu.SIGNIN);
        
        return result;
    } catch (err) {
        throw(err);
    }
}
*/
export const signOut = async (userId) => {
    try {
        let result = await LUser.remove(userId);
        // switch menu
        switchMenuTo(userId, Config.richmenu.SIGNIN);
        
        return result;
    } catch (err) {
        throw(err);
    }
}


  