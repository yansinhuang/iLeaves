import {
    getDoc, updateDoc, createNewDoc, removeDoc, getDocsWithQuery
} from './utils';

const KEY_ACCOUNT = 'Account';
const KEY_STAFF = 'Staff';

export const checkExist = async (ubn, email) => {
    try {
        return await getDoc(`${KEY_ACCOUNT}/${ubn}/${KEY_STAFF}`, email);
    } catch (error) {
        return false;
    }
}

export const fetch = async (ubn, email) => {
    return await getDoc(`${KEY_ACCOUNT}/${ubn}/${KEY_STAFF}`, email);
}

export const create = async (ubn, data) => {
    return await createNewDoc(`${KEY_ACCOUNT}/${ubn}/${KEY_STAFF}`, data, data.email);
}

export const update = async (ubn, data) => {
    return await updateDoc(`${KEY_ACCOUNT}/${ubn}/${KEY_STAFF}`, data.email, data);
}

export const remove = async (ubn, email) => {
    return await removeDoc(`${KEY_ACCOUNT}/${ubn}/${KEY_STAFF}`, email);
}
export const searchEmail = async (ubn, email, page, size) => {
    let result = await getDocsWithQuery(`${KEY_ACCOUNT}/${ubn}/${KEY_STAFF}`, 'email', email, page, size);
    return result;
}
export const search = async (ubn, query, value, page, size) => {
    let result = await getDocsWithQuery(`${KEY_ACCOUNT}/${ubn}/${KEY_STAFF}`, query, value, page, size);
    return result;
}
