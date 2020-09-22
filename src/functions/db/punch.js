import * as admin from 'firebase-admin';
import {
    getDoc, updateDoc, getDocsWithQuery, createNewDoc, getAllDocs, removeDoc
} from './utils';
import {
    getNowInSec
} from '../utils/dateTime';

const KEY_ACCOUNT = 'Account';
const KEY_PUNCH = 'Punch';

export const create = async (ubn, data) => {
    return await createNewDoc(`${KEY_ACCOUNT}/${ubn}/${KEY_PUNCH}`, data);
}

export const search = async (ubn, query, value, page, size) => {
    let result = await getDocsWithQuery(`${KEY_ACCOUNT}/${ubn}/${KEY_PUNCH}`, query, value, page, size);
    return result;
}