import {
    getDoc, updateDoc, getDocsWithQuery, createNewDoc, getAllDocs, removeDoc
} from './utils';

const KEY_ADMIN = 'Admin';
const KEY_ROLE = 'Role';

export const checkExist = async (email) => {
    try {
        return await getDoc(KEY_ADMIN, email);
    } catch (error) {
        return false;
    }
}

export const fetch = async (email) => {
    return await getDoc(KEY_ADMIN, email);
}

export const fetchByUid = async (uid) => {
    let result = await getDocsWithQuery(KEY_ADMIN, 'uid', uid);
    return result.size > 0 ? result.list[0] : null;
}

export const search = async (email, page, size) => {
    let result = await getDocsWithQuery(KEY_ADMIN, 'email', email, page, size);
    return result;
}

export const create = async (data) => {
    return await createNewDoc(KEY_ADMIN, data, data.email);
}

export const update = async (data) => {
    return await updateDoc(KEY_ADMIN, data.email, data);
}

export const remove = async (email) => {
    return await removeDoc(KEY_ADMIN, email);
}

export const fetchRoles = async () => {
    return await getAllDocs(KEY_ROLE);
}