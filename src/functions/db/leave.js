import * as admin from 'firebase-admin';
import {
    getDoc, updateDoc, getDocsWithQuery, createNewDoc, getAllDocs, removeDoc
} from './utils';
import {
    getNowInSec
} from '../utils/dateTime';

const KEY_ACCOUNT = 'Account';
const KEY_LEAVE = 'Leave';

export const create = async (ubn, data) => {
    return await createNewDoc(`${KEY_ACCOUNT}/${ubn}/${KEY_LEAVE}`, data);
}

export const search = async (ubn, query, value, page, size) => {
    let result = await getDocsWithQuery(`${KEY_ACCOUNT}/${ubn}/${KEY_LEAVE}`, query, value, page, size);
    return result;
}

/*
export const update = async (data) => {
    var time = getNowInSec();
    data.ubn = time.toString(10);
    const docRef = admin.firestore().collection(KEY_LEAVE).doc(data.ubn);
    data.lastUpdated = getNowInSec();
    return new Promise((resolve, reject) => {
        docRef.set(data).then(ref => {
            resolve(data);
        }).catch(err => {
            reject(err);
        });
    });
}
*/

export const update = async (ubn, data) => {
    return await updateDoc(`${KEY_ACCOUNT}/${ubn}/${KEY_LEAVE}`, data.id, data);
}

export const fetch = async (ubn, id) => {
    return await getDoc(`${KEY_ACCOUNT}/${ubn}/${KEY_LEAVE}`, id);
}