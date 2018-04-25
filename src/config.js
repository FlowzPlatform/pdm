
module.exports = {
    "host": "localhost",
    "port": 3038,
    "public": "../public/",
    "domainKey": process.env.domainKey,
    "paginate": {
        "default": 10,
        "max": 50
    },
    "rethinkdb": {
        "db": "feather_product",
        "servers": [
            {
                "host": process.env.RDB_HOST,
                "port": process.env.RDB_PORT
            }
        ]
    },
    "jobQueue": {
        "url": "http://api." + process.env.domainKey + "/rjobqueue1/job/create",
        "db": process.env.JQ_DB,
        "host": process.env.JQ_HOST,
        "port": process.env.JQ_PORT
    },
    "credOptions": {
        "index" : process.env.index,
        "username": "",
        "password": "",
        "type": ""
    },
    "esUrl": process.env.esUrl,
    "secret": process.env.secret,
    "auth_url": "http://api." + process.env.domainKey + "/user/getuserdetails/ index=pdm1",
    "userDetailApi": "http://api." + process.env.domainKey + "/auth/api/userdetails",
    "loginUrl": "https://api." + process.env.domainKey + "/auth/api/login",
    "pwd": process.env.pwd,
    "wsPort": process.env.wsport || "4038"
}
