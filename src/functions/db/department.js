import {
    getDoc, updateDoc, createNewDoc, removeDoc, getDocsWithQuery
} from './utils';
const KEY_ACCOUNT = 'Account';
const KEY_DEPARTMENT = 'Department';

export const checkExist = async (ubn, name) => {
    try {
        const result = await search(ubn, "name", name, 0, 10);
        if (result.size == 0){
            return false;
        } else {
            return true;
        }
    } catch (error) {
        return false;
    }
}

export const create = async (ubn, data) => {
    return await createNewDoc(`${KEY_ACCOUNT}/${ubn}/${KEY_DEPARTMENT}`, data);
}

export const search = async (ubn, query, value, page, size) => {
    let result = await getDocsWithQuery(`${KEY_ACCOUNT}/${ubn}/${KEY_DEPARTMENT}`, query, value, page, size);
    return result;
}

export const fetch = async (ubn, id) => {
    return await getDoc(`${KEY_ACCOUNT}/${ubn}/${KEY_DEPARTMENT}`, id);
}

export const update = async (ubn, data) => {
    return await updateDoc(`${KEY_ACCOUNT}/${ubn}/${KEY_DEPARTMENT}`, data.id, data);
}