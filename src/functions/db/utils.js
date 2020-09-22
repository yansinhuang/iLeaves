import * as admin from 'firebase-admin'
import {
    getNowInSec
} from '../utils/dateTime'
import { ErrorWithCode } from '../utils/error';

export const getNewDocId = (key) => {
    const snapshot = admin.firestore().collection(key).doc();
    return snapshot.id;
}

export const createNewDoc = async (key, data, id = getNewDocId(key)) => {
    const colRef = admin.firestore().collection(key);
    data.createTime = getNowInSec();
    data.lastUpdate = getNowInSec();
    data.id = id;

    await colRef.doc(id).set(data);
    return data;
}

export const updateDoc = async (key, id, data) => {
    const colRef = admin.firestore().collection(key);
    data.lastUpdate = getNowInSec();

    await colRef.doc(id).set(data);
    return data;
}

export const removeDoc = async (key, id) => {
    const colRef = admin.firestore().collection(key);

    await colRef.doc(id).delete();
    return { id };
}

export const getDoc = async (key, id) => {
    const docRef = admin.firestore().collection(key).doc(id);
    let snapshot = await docRef.get();
    return snapshot.data();
}

export const getDocsWithQuery = async (key, query, value, page, size) => {
    var colRef = admin.firestore().collection(key);
    if (query && value) {
        colRef = colRef.where(query, '==', value);
    }

    let countSnapshot = await colRef.get();
    let total = countSnapshot.size;
    
    colRef = colRef.orderBy('lastUpdate');
    if (size) {
        let nSize = parseInt(size);
        let nPage = parseInt(page);
        colRef = colRef.limit(nSize).offset(nPage * nSize);
    }

    let snapshot = await colRef.get();
    if (snapshot.empty) {
        return {
            size: 0,
            page: 0,
            list: []
        };
    }
    let list = snapshot.docs.map(doc => doc.data());
    return {
        size: total,
        page: parseInt(page),
        list
    };
}

export const getDocsWithDoubleQuery = async (key, queryA, valueA, queryB, valueB , page, size) => {
    var colRef = admin.firestore().collection(key);
    if (query && value) {
        colRef = colRef.where(queryA, '==', valueA).where(queryB, '==', valueB);
    }

    let countSnapshot = await colRef.get();
    let total = countSnapshot.size;
    
    colRef = colRef.orderBy('lastUpdate');
    if (size) {
        let nSize = parseInt(size);
        let nPage = parseInt(page);
        colRef = colRef.limit(nSize).offset(nPage * nSize);
    }

    let snapshot = await colRef.get();
    if (snapshot.empty) {
        return {
            size: 0,
            page: 0,
            list: []
        };
    }
    let list = snapshot.docs.map(doc => doc.data());
    return {
        size: total,
        page: parseInt(page),
        list
    };
}

export const getAllDocs = async (key) => {
    const snapshot = await admin.firestore().collection(key).get();
    return snapshot.docs.map(doc => doc.data());
}