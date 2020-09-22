import moment from "moment-timezone";

export const getNowInSec = () => {
    return moment().unix();
}