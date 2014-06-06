/**
* @ignore
*/

function uuid4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

function guid() {
    return uuid4() + uuid4() + '-' + uuid4() + '-' + uuid4() + '-' + uuid4()
            + '-' + uuid4() + uuid4() + uuid4();
}