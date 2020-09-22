import fetch from 'node-fetch';
import querystring from 'querystring';
import {
  URL, URLSearchParams
} from 'url';

const post = async(url, postData) => {
    try {
        var url = new URL(url);
        const params = new URLSearchParams();
        Object.getOwnPropertyNames(postData).filter((prop) => {
            params.append(prop, postData[prop]);
        });
        var response = await fetch(url.toString(), {
            method: 'POST',
            body: params
        });

        if (response.status == 200) {
            const result = await response.json();
            return result;
        } else {
            var err = await response.json();
            throw err;
        }
    } catch (err) {
        throw err;
    }
}

const postjson = async(url, postData, headers) => {
    try {
        var url = new URL(url);
        var response = await fetch(url.toString(), {
            method: 'POST',
            body: JSON.stringify(postData),
            headers
        });

        if (response.status == 200) {
            const result = await response.json();
            return result;
        } else {
            var err = await response.json();
            throw err;
        }
    } catch (err) {
        throw err;
    }
}

const get = async(url, paramMap, isJsonRes) => {
    try {
        var url = new URL(url);
        const params = new URLSearchParams();
        Object.getOwnPropertyNames(paramMap).filter((prop) => {
            url.searchParams.append(prop, paramMap[prop]);
        });

        var response = await fetch(url, {
            method: 'GET'
        });

        if (response.status == 200) {
            if(isJsonRes) {
                return await response.json();
            }
            else {
                return response.text();
            }
        } else {
            var err = await response.json();
            throw err;
        }
    } catch (err) {
        throw err;
    }
}

module.exports = {
    post: post,
    postjson: postjson,
    get: get
};
