import {
    checkExist,
    fetch,
    create,
    update,
    remove,
    fetchByUid,
    fetchRoles,
    search
} from '../db/admin';
import {
    checkUserExist,
    createUser,
    deleteUser
} from './auth';
import httpClient from '../utils/httpClient';
import Config from '../config';
import {
    ErrorWithCode
} from '../utils/error';
import {
    partialUpdateObject
} from '../utils/partialUpdate';

export const createAdmin = async (admin) => {
    try {
        const { email, password, name } = admin;
        let isExist = await checkUserExist(email);
        if (isExist) throw(ErrorWithCode('Account is already create:' + email));
        
        isExist = await checkExist(email);
        if (isExist) throw(ErrorWithCode('Account is already create:' + email));
        
        const user = await createUser(email, password, name);
        admin.uid = user.uid;
        delete admin.password;

        const result = await create(admin);
        return result;
    } catch(err) {
        throw(err);
    }
}

export const updateAdmin = async (email, updateData) => {
    try {
        let data = await fetch(email);
        if (!data) throw(ErrorWithCode('Account is not create:' + email));
        
        const supportFields = [
            'name',
            'role'
        ];
        data = partialUpdateObject(data, updateData, supportFields);
        return await update(data);
    } catch(err) {
        throw(err);
    }
}

export const deleteAdmin = async (email) => {
    try {
        await deleteUser(email);
        return await remove(email);
    } catch (err) {
        throw(err);
    }
}

export const getAdmin = async (email) => {
    try {
        let data = await fetch(email);
        if (!data) throw(ErrorWithCode('Account is not create:' + email));
        
        return {
            name: data.name,
            email: data.email,
            role: data.role,
            uid: data.uid,
            lastUpdate: data.lastUpdate
        };
    } catch(err) {
        throw(err);
    }
}

export const getAdminById = async (uid) => {
    try {
        let data = await fetchByUid(uid);
        if (!data) throw(ErrorWithCode('Account is not create:' + uid));
        
        return {
            name: data.name,
            email: data.email,
            role: data.role,
            uid: data.uid,
            lastUpdate: data.lastUpdate
        };
    } catch (err) {
        throw(err);
    }
}

export const getAdmins = async (email, page = 0, size = 10) => {
    try {
        let datas = await search(email, page, size);
        return datas;
    } catch (err) {
        throw(err);
    }
}

export const signin = async (email, password) => {
    try {
        const url = `${Config.firebase.authUrl}/accounts:signInWithPassword?key=${Config.firebase.apiKey}`;
        const result = await httpClient.postjson(url, {
            email, 
            password,
            returnSecureToken: true
        });
        let admin = await getAdmin(email);
        admin.sessionToken = result.idToken;
        admin.refreshToken = result.refreshToken;
        return admin;
    } catch (error) {
        throw(ErrorWithCode(error.error.message, 401));
    }
}

export const getRoles = async () => {
    try {
        let roles = await fetchRoles();
        if (!roles) throw(ErrorWithCode('Roles have not setup!'));

        return roles;
    } catch (err) {
        throw(err);
    }
}

export const resetPassword = async (email) => {
    try {
        const url = `${Config.firebase.authUrl}/accounts:sendOobCode?key=${Config.firebase.apiKey}`;
        const result = await httpClient.postjson(url, {
            email,
            requestType: 'PASSWORD_RESET'
        });
        return result;
    } catch (err) {
        throw(err);
    }
}

export const refreshToken = async (token) => {
    try {
        const url = `${Config.firebase.secureUrl}/token?key=${Config.firebase.apiKey}`;
        const result = await httpClient.post(url, {
            grant_type: 'refresh_token',
            refresh_token: token
        });
        return {
            uid: result.user_id,
            sessionToken: result.id_token,
            refreshToken: result.refresh_token
        };
    } catch (err) {
        throw(err);
    }
}