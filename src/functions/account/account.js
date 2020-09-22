import {
    checkExist,
    fetch,
    create,
    update,
    search
} from '../db/account';
import {
    ErrorWithCode
} from '../utils/error';
import {
    partialUpdateObject
} from '../utils/partialUpdate';
import { 
    checkUserExist, 
    createUser
} from '../admin/auth';

export const createAccount = async (account) => {
    try {
        const { ubn, email, password, name } = account;
        let isExist = await checkExist(ubn);
        if (isExist) throw(ErrorWithCode('Account is already create:' + ubn));

        isExist = await checkUserExist(email);
        if (isExist) throw(ErrorWithCode('Account.Email is duplicated:' + email));
        
        const user = await createUser(email, password, name);
        account.uid = user.uid;
        account.status = 0;
        delete account.password;

        const result = await create(account);
        return result;
    } catch(err) {
        throw(err)
    }
}

export const updateAccount = async (ubn, updateData) => {
    try {
        let data = await fetch(ubn);
        if (!data) throw(ErrorWithCode('Account is not create:' + ubn));
        
        const supportFields = [
            'name',
            'address',
            'phone',
            'status'
        ];
        data = partialUpdateObject(data, updateData, supportFields);
        return await update(data);
    } catch(err) {
        throw(err)
    }
}

export const getAccount = async (ubn) => {
    try {
        let data = await fetch(ubn);
        if (!data) throw(ErrorWithCode('Account is not create:' + ubn));
        
        return {
            ...data
        };
    } catch(err) {
        throw(err)
    }
}

export const getAccountById = async (uid) => {
    try {
        let data = await fetchByUid(uid);
        if (!data) throw(ErrorWithCode('Account is not create:' + uid));
        
        return {
            ...data
        };
    } catch (err) {
        throw(err);
    }
}

export const getAccounts = async (ubn, page = 0, size = 10) => {
    try {
        let datas = await search(ubn, page, size);
        return datas;
    } catch (err) {
        throw(err);
    }
}