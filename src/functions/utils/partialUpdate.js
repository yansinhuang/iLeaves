import {
    ErrorWithCode
} from '../utils/error';

export const partialUpdateObject = (target, source, supportFields) => {
    if (!target || !source || !supportFields) return target;
  
    Object.keys(source).forEach(function (key) {
        if (supportFields.includes(key)) {
            if (typeof source[key] !== 'undefined' && source[key] !== null) {
                    target[key] = source[key];
                    
            }
        }
    });
    return target
}