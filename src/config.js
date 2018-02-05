
module.exports = {
    "host": "localhost",
    "port": 3038,
    "public": "../public/",
    "domainKey": process.env.domainkey,
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
        "url": "http://api." + process.env.domainkey + "/rjobqueue1/job/create",
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
    "auth_url": "http://api." + process.env.domainkey + "/user/getuserdetails/ index=pdm1",
    "userDetailApi": "http://auth." + process.env.domainkey + "/api/userdetails",
    "pwd": process.env.pwd,
    "wsPort": process.env.wsport || "4038"
}