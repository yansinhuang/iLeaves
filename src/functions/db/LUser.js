import {
    getDoc, updateDoc, createNewDoc, removeDoc, getDocsWithQuery
} from './utils';

const KEY_LUSER = 'LUser';

export const create = async (userId, data) => {
    return await createNewDoc(`${KEY_LUSER}`, data, userId);
}

export const get = async (userId) => {
    return await getDoc(`${KEY_LUSER}`, userId);
}

export const checkExist = async (userId) => {
    try {
        return await getDoc(`${KEY_LUSER}`, userId);
    } catch (error) {
        return false;
    }
}

export const remove = async (userId) => {
    return await removeDoc(`${KEY_LUSER}`, userId);
}

