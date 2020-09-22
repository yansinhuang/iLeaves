import {
    getDoc, updateDoc, getDocsWithQuery, createNewDoc
} from './utils';

const KEY_ACCOUNT = 'Account';

export const checkExist = async (ubn) => {
    try {
        return await getDoc(KEY_ACCOUNT, ubn);
    } catch (error) {
        return false;
    } 
}

export const fetch = async (ubn) => {
    return await getDoc(KEY_ACCOUNT, ubn);
}

export const fetchByUid = async (uid) => {
    let result = await getDocsWithQuery(KEY_ACCOUNT, 'uid', uid);
    return result.size > 0 ? result.list[0] : null;
}

export const search = async (email, page, size) => {
    let result = await getDocsWithQuery(KEY_ACCOUNT, 'ubn', email, page, size);
    return result;
}

export const create = async (data) => {
    return await createNewDoc(KEY_ACCOUNT, data, data.ubn);
}

export const update = async (data) => {
    return await updateDoc(KEY_ACCOUNT, data.ubn, data);
}
