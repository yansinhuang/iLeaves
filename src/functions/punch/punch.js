import {
    create,
    search
} from '../db/punch';
import {
    pushMessage
} from '../message/lineUtils'
import {
    getStaff
} from '../staff/staff'
import {
    getDepartment
} from '../department/department'
import {
    partialUpdateObject
} from '../utils/partialUpdate'
import {
    ErrorWithCode
} from '../utils/error';

export const createPunch = async (ubn, punch) => {
    try {
        const result = await create(ubn, punch);
        return result;
    } catch(err) {
        throw(err)
    }
}

export const getTodayPunches = async (ubn, query, value, page = 0, size = 1000) => {
    try {
        let data = await search(ubn, query, value, page, size);
        var today = new Date().getDate();
        let result = [];
        //console.log("===> data.list.length " + data.list.length);
        for (var i = 0; i < data.list.length; i++) {
            var datetime = new Date((data.list[i].createTime)*1000);
            var date = datetime.getDate();
            if (date == today) {
                result.push(data.list[i]); 
            }
        }
        return result;
    } catch(err) {
        throw(err)
    }
}

export const getPunches = async (ubn, query, value, page = 0, size = 1000) => {
    try {
        let data = await search(ubn, query, value, page, size);
        return data;
    } catch(err) {
        throw(err)
    }
}