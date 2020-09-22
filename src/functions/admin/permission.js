import {
    getAdminById
} from '../admin/admin';
import {
    ErrorWithCode
} from '../utils/error';

export const role = {
    SUPER_ADMIN: 0,
    ADMIN: 1,
    MARKETING: 2
}

export const checkPermission = async (uid, permission) => {
    const admin = await getAdminById(uid);
    if (admin.role > permission) {
        throw ErrorWithCode('You need higher permission', 401);
    }
}