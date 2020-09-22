import {
    checkExist
} from '../db/department'
import {
    create,
    fetch,
    update
} from '../db/department'
import {
    ErrorWithCode
} from '../utils/error';
import {
    partialUpdateObject
} from '../utils/partialUpdate'

export const createDepartment = async (ubn, department) => {
    try { 
        
        // database
        let isExist = await checkExist(ubn, department.name);
        if (isExist) throw(ErrorWithCode('Department is already created in Database:' + department.name));

        const result = await create(ubn, department);
        return result;
    } catch(err) {
        throw(err)
    }
}

export const getDepartment = async (ubn, departmentId) => {
    try {
        let data = await fetch(ubn, departmentId);
        if (!data) throw(ErrorWithCode('Department is not created:' + departmentId));        
        return data;
    } catch(err) {
        throw(err);
    }
}

export const updateDepartment = async (ubn, id, updateData) => {
    try {
        let data = await fetch(ubn, id);
        if (!data) throw(ErrorWithCode('Leave is not created:' + id));
        
        const supportFields = [
            'name',
            'supervisor'
        ];
        data = partialUpdateObject(data, updateData, supportFields);
        return await update(ubn, data);
    } catch(err) {
        throw(err);
    }
}